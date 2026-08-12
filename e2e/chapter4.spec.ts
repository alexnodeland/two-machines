import { expect, test } from '@playwright/test'

// Chapter 4 against the built prefixed output: six lessons, each deep-linking
// the Rig with a preset, quotes within budget resolving to /sources.

test('the grammar renders its six lessons with marks and citations', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/machine/the-grammar/')
  await expect(page).toHaveTitle(/The grammar/)
  for (const lesson of [
    'Three notes and silence',
    'Beeping and droning',
    'Not committing',
    'Avoiding mud',
    'Volume swells and soft attack',
    'Writing a structure',
  ]) {
    await expect(page.getByRole('heading', { name: new RegExp(lesson) })).toBeVisible()
  }
  await expect(page.getByText(/sonic equivalent of mud/)).toBeVisible()
  await expect(page.getByText(/organ drone in D/)).toBeVisible()
  expect(await page.locator('[data-editorial-mark]').count()).toBeGreaterThanOrEqual(2)
  expect(await page.locator('[data-editorial-mark] [data-citation]').count()).toBe(0)
  expect(errors).toEqual([])
})

test('a lesson deep-links the Rig with its preset loaded', async ({ page }) => {
  await page.goto('/two-machines/machine/the-grammar/')
  await page.getByRole('link', { name: /Open the rig with this lesson/ }).click()
  await expect(page).toHaveURL(/\?preset=three-notes/)
  // three-notes: 3.5 s of tape at 0.80 — applied and clamped-safe on read
  await expect(page.locator('p[data-readout]')).toContainText('3.50 s')
})

test('every chapter-4 citation resolves on /sources', async ({ page }) => {
  await page.goto('/two-machines/machine/the-grammar/')
  const citations = page.locator('[data-citation]')
  const count = await citations.count()
  expect(count).toBeGreaterThanOrEqual(4)
  const keys = new Set<string>()
  for (let i = 0; i < count; i++) {
    keys.add((await citations.nth(i).getAttribute('data-citation')) ?? '')
  }
  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`#${key}`)).toBeVisible()
  }
})
