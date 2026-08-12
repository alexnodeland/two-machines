import { expect, test } from '@playwright/test'

// Chapters 9 and 10: the tuning and the line.

test('the tuning keeps the mark/hedge split exact', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/discipline/harmony/')
  await expect(page).toHaveTitle(/The tuning/)
  await expect(page.getByText(/perfect fifths upward from the low C/)).toBeVisible()
  // The resonance is marked ours; the intent question stays a question.
  await expect(page.getByText(/a question, not a claim/)).toBeVisible()
  expect(await page.locator('[data-editorial-mark]').count()).toBeGreaterThanOrEqual(2)
  expect(await page.locator('[data-editorial-mark] [data-citation]').count()).toBe(0)
  expect(errors).toEqual([])
})

test('the line admits its thinness on the page', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/discipline/melody/')
  await expect(page).toHaveTitle(/The line/)
  await expect(page.getByText(/thinnest chapter on the site/)).toBeVisible()
  await expect(page.getByText(/honest beats thick/)).toBeVisible()
  await expect(
    page.getByText(/blossom into the most spectacular polyphonic/)
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('chapter 9-10 citations resolve', async ({ page }) => {
  const keys = new Set<string>()
  for (const path of [
    '/two-machines/discipline/harmony/',
    '/two-machines/discipline/melody/',
  ]) {
    await page.goto(path)
    const citations = page.locator('[data-citation]')
    const count = await citations.count()
    expect(count).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < count; i++) {
      keys.add((await citations.nth(i).getAttribute('data-citation')) ?? '')
    }
  }
  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`#${key}`)).toBeVisible()
  }
})
