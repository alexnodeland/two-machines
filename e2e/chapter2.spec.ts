import { expect, test } from '@playwright/test'

// Chapter 2: the non-hagiographic lineage — a credibility gate (ADR-005).

test('the lineage renders every arrival, non-hagiographically', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/machine/where-it-came-from/')
  await expect(page).toHaveTitle(/Where it came from/)
  await expect(page.getByText(/Fripp did not invent the two-machine delay/)).toBeVisible()
  await expect(page.getByText(/came along with the machine/)).toBeVisible()
  for (const node of [
    'morphophone',
    'Three Loops for Performers and Tape Recorders',
    'Time Lag Accumulator',
    'I of IV',
    'the Kitchen, 5 February 1978',
  ]) {
    await expect(page.getByText(new RegExp(node)).first()).toBeVisible()
  }
  // The sole-authority hedge is on the page, not just in the corpus.
  await expect(page.getByText(/Both dates rest on Tamm/)).toBeVisible()
  expect(errors).toEqual([])
})

test('every lineage citation resolves on /sources', async ({ page }) => {
  await page.goto('/two-machines/machine/where-it-came-from/')
  const citations = page.locator('[data-citation]')
  const count = await citations.count()
  expect(count).toBeGreaterThanOrEqual(8)
  const keys = new Set<string>()
  for (let i = 0; i < count; i++) {
    keys.add((await citations.nth(i).getAttribute('data-citation')) ?? '')
  }
  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`#${key}`)).toBeVisible()
  }
})
