import { expect, test } from '@playwright/test'

// The interlock, held to its plan — meters-only guarantee printed, interlock
// numbers from the engine, the not-Reich distinction, the testable 14.

test('the interlock renders its guarantee, its numbers, and its testable 14', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/discipline/rhythm/')
  await expect(page).toHaveTitle(/The interlock/)
  await expect(page.getByText(/cycle lengths and\s+downbeats only/)).toBeVisible()
  await expect(page.getByText(/come home every 210 sixteenths/)).toBeVisible()
  await expect(page.getByText(/3,570 pulses/)).toBeVisible()
  await expect(page.getByText(/this is not Reich\s+phasing/)).toBeVisible()
  await expect(page.getByText(/it varies a bit along the way/).first()).toBeVisible()
  await expect(page.getByText(/usually given as fourteen/)).toBeVisible()
  await expect(page.getByText(/load your own count in the rack/)).toBeVisible()
  expect(errors).toEqual([])
})

test('the discipline preset is embedded and playable', async ({ page }) => {
  await page.goto('/two-machines/discipline/rhythm/')
  const instrument = page.locator('[data-instrument="cycles"]')
  await expect(instrument).toHaveCount(1)
  await expect(instrument.locator('dl[aria-label="Readouts"]')).toContainText(
    '3570 pulses'
  )
  // The instruction lives at the embed, not two sections later (Plan-002 B).
  await expect(page.getByText(/Press play and let it run — do not count/)).toBeVisible()
  await expect(page.getByText(/Watch the pulse readouts instead/)).toBeVisible()
})

test('chapter-8 citations resolve; marks and citations never nest', async ({ page }) => {
  await page.goto('/two-machines/discipline/rhythm/')
  const citations = page.locator('[data-citation]')
  expect(await citations.count()).toBeGreaterThanOrEqual(4)
  expect(await page.locator('[data-editorial-mark] [data-citation]').count()).toBe(0)
  const keys = new Set<string>()
  const count = await citations.count()
  for (let i = 0; i < count; i++) {
    keys.add((await citations.nth(i).getAttribute('data-citation')) ?? '')
  }
  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`[id="${key}"]`)).toBeVisible()
  }
})
