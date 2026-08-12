import { expect, test } from '@playwright/test'

// Part I, the thesis chapter, against the built prefixed output. Its
// acceptance (docs/chapters/part-1-two-cycles.md): the argument lands with
// the interlock printed as 17, the editorial mark visible and uncited, and
// the drift/offset distinction demonstrated, not described.

test('the thesis chapter renders with its mark and its numbers', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/two-cycles/')
  await expect(page).toHaveTitle(/Two Cycles/)

  // The page-level editorial mark, and no citation anywhere near it (ADR-003).
  const marks = page.locator('[data-editorial-mark]')
  await expect(marks.first()).toBeVisible()
  expect(await page.locator('[data-citation]').count()).toBe(0)

  // The load-bearing numbers, in the prose (ADR-018: 17, never 18).
  await expect(page.getByText(/17 consecutive pulses/)).toBeVisible()
  await expect(page.getByText(/least common multiple of 5 and 7/)).toBeVisible()
  await expect(page.getByText(/210/).first()).toBeVisible()

  expect(errors).toEqual([])
})

test('three playable embeds carry the argument, ending in drift', async ({ page }) => {
  await page.goto('/two-machines/two-cycles/')
  const instruments = page.locator('[data-instrument="cycles"]')
  await expect(instruments).toHaveCount(3)

  // The last embed opens in drift: grid disabled, dials selected — the
  // distinction is enforced structurally, not narrated (ADR-016).
  const drift = instruments.nth(2)
  await expect(drift.getByRole('button', { name: 'grid' })).toBeDisabled()
  await expect(drift.getByRole('button', { name: 'dials' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await expect(drift.locator('dl[aria-label="Readouts"]')).toContainText('never')

  // And the first is playable in place.
  const claps = instruments.first()
  await claps.getByRole('button', { name: 'Play' }).click()
  await expect(claps.getByRole('button', { name: 'Stop' })).toBeVisible()
  await claps.getByRole('button', { name: 'Stop' }).click()
})
