import { expect, test } from '@playwright/test'

// The screen-reader prep sweep (Plan-002 Phase E). Axe covers the rulebook;
// these are the walks a rulebook misses: one of each landmark per page, a
// heading order that never skips, a name on every control, and honest
// keyboard behaviour in the disclosures. This does NOT replace the human
// listen-through — it keeps the ground under it from regressing.

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

for (const path of PAGES) {
  test(`one banner, one main, one contentinfo on ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('banner')).toHaveCount(1)
    await expect(page.getByRole('main')).toHaveCount(1)
    await expect(page.getByRole('contentinfo')).toHaveCount(1)
  })

  test(`heading levels never skip on ${path}`, async ({ page }) => {
    await page.goto(path)
    const levels = await page
      .locator('h1, h2, h3, h4, h5, h6')
      .evaluateAll((els) => els.map((el) => Number(el.tagName.slice(1))))
    expect(levels.length).toBeGreaterThan(0)
    expect(levels[0]).toBe(1)
    expect(levels.filter((l) => l === 1)).toHaveLength(1)
    for (let i = 1; i < levels.length; i++) {
      const step = (levels[i] as number) - (levels[i - 1] as number)
      expect(step, `h${levels[i - 1]} → h${levels[i]} at index ${i}`).toBeLessThanOrEqual(
        1
      )
    }
  })

  test(`every button and link has an accessible name on ${path}`, async ({ page }) => {
    await page.goto(path)
    for (const role of ['button', 'link'] as const) {
      const controls = page.getByRole(role)
      const count = await controls.count()
      for (let i = 0; i < count; i++) {
        await expect(controls.nth(i)).toHaveAccessibleName(/\S/)
      }
    }
  })
}

test('the Map disclosure is keyboard-honest: Enter opens, Tab lands inside', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/what-it-is/')
  const toggle = page.getByRole('button', { name: 'Map' })
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Tab')
  const landedOnFirstMapLink = await page.evaluate(() => {
    const first = document.querySelector('[data-map] a')
    return first !== null && document.activeElement === first
  })
  expect(landedOnFirstMapLink).toBe(true)
})

test('the rig announces its state politely on the index', async ({ page }) => {
  await page.goto('/two-machines/')
  const summary = page.locator('[data-instrument="rig"] [data-summary]')
  await expect(summary).toHaveAttribute('aria-live', 'polite')
  await expect(summary).toContainText(/Silent until you press the pad/)
})

test('the sound bar status is a polite live region on every page it guards', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/the-grammar/')
  const status = page.locator('[data-soundbar-status]')
  await expect(status).toHaveAttribute('aria-live', 'polite')
  await expect(status).toHaveText('Silent')
})
