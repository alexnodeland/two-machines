import { expect, test } from '@playwright/test'

// The mobile leg of the Phase 6 pass, at the 375 px floor the plan names.
// Two rules from design-system §8: the page body never scrolls sideways, and
// the bench keeps its fixed scale by scrolling inside its own window.

const PAGES = [
  '/two-machines/',
  '/two-machines/two-cycles/',
  '/two-machines/cycles/',
  '/two-machines/machine/what-it-is/',
  '/two-machines/machine/where-it-came-from/',
  '/two-machines/machine/what-the-tape-does/',
  '/two-machines/machine/the-grammar/',
  '/two-machines/machine/the-four-modes/',
  '/two-machines/machine/building-it/',
  '/two-machines/discipline/where-the-numbers-come-from/',
  '/two-machines/discipline/rhythm/',
  '/two-machines/discipline/harmony/',
  '/two-machines/discipline/melody/',
  '/two-machines/the-room/',
  '/two-machines/listen/',
  '/two-machines/sources/',
  '/two-machines/colophon/',
]

test.use({ viewport: { width: 375, height: 700 } })

for (const path of PAGES) {
  test(`no sideways page scroll at 375px on ${path}`, async ({ page }) => {
    await page.goto(path)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('the bench is a window at 375px: fixed scale, scrollable span', async ({ page }) => {
  await page.goto('/two-machines/')
  // The ruler stays true — the readout prints the same fixed-scale numbers
  // it prints on a desktop (ADR-011: a scale that changed with viewport
  // width would make the readout a lie).
  await expect(page.locator('p[data-readout]')).toContainText('80.0 cm · 4.20 s')
  // The window really is a window: the bench inside is wider than the
  // viewport, and the view pans.
  const bench = page.locator('[data-bench-window]')
  expect(await bench.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true)
  await bench.evaluate((el) => {
    el.scrollLeft = 300
  })
  expect(await bench.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0)
  // Vertical page scroll stays with the page; horizontal belongs to the
  // window; the deck opts out entirely so dragging a deck moves the deck.
  await expect(bench).toHaveCSS('touch-action', 'pan-x pan-y')
  await expect(page.locator('[data-deck="play"]')).toHaveCSS('touch-action', 'none')
})
