import { expect, test } from '@playwright/test'

// Chapters 6 and 7 against the built prefixed output.

test('building-it renders four tiers, the kit quote, and the translation table', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/machine/building-it/')
  for (const tier of ['Pedalboard', 'DAW or patch', 'Code', 'Tape']) {
    await expect(page.getByRole('heading', { name: tier })).toBeVisible()
  }
  await expect(page.getByText(/any electric guitar, distortion FX/)).toBeVisible()
  await expect(page.getByText('lift the record head')).toBeVisible()
  expect(errors).toEqual([])
})

test('where-the-numbers-come-from reports without endorsing', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/discipline/where-the-numbers-come-from/')
  await expect(page).toHaveTitle(/Where the numbers come from/)
  // The true part is offered for verification; the doctrine is reported.
  await expect(page.getByText(/mi to fa, and si to do/)).toBeVisible()
  await expect(page.getByText(/that reading is doctrine, reported here/)).toBeVisible()
  // The open question stays open, in so many words (ADR-044's line).
  await expect(page.getByText(/an open question/)).toBeVisible()
  // No editorial marks by design: everything is sourced, reported or demonstrable.
  expect(await page.locator('[data-editorial-mark]').count()).toBe(0)
  expect(errors).toEqual([])
})

test('chapter 6-7 citations resolve on /sources', async ({ page }) => {
  const keys = new Set<string>()
  for (const path of [
    '/two-machines/machine/building-it/',
    '/two-machines/discipline/where-the-numbers-come-from/',
  ]) {
    await page.goto(path)
    const citations = page.locator('[data-citation]')
    const count = await citations.count()
    for (let i = 0; i < count; i++) {
      keys.add((await citations.nth(i).getAttribute('data-citation')) ?? '')
    }
  }
  expect(keys.size).toBeGreaterThanOrEqual(4)
  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`#${key}`)).toBeVisible()
  }
})
