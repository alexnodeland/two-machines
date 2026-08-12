import { expect, test } from '@playwright/test'

// Navigation: the header hand-rail on every page, and the chapter pager
// walking the reading order in both directions.

test('the header is on every page and the wordmark goes home', async ({ page }) => {
  for (const path of [
    '/two-machines/',
    '/two-machines/machine/building-it/',
    '/two-machines/sources/',
  ]) {
    await page.goto(path)
    const header = page.locator('[data-site-header]')
    await expect(header).toBeVisible()
    await expect(header.getByRole('link', { name: 'Two Machines' })).toBeVisible()
    await expect(header.getByRole('link', { name: 'Sources' })).toBeVisible()
  }
  await page.goto('/two-machines/machine/the-grammar/')
  await page
    .locator('[data-site-header]')
    .getByRole('link', { name: 'Two Machines' })
    .click()
  await expect(page).toHaveURL(/\/two-machines\/$/)
})

test('the pager walks the reading order both ways', async ({ page }) => {
  await page.goto('/two-machines/machine/what-it-is/')
  const pager = page.locator('[data-pager]')
  await expect(pager.getByRole('link', { name: /Two cycles/ })).toBeVisible()
  await pager.getByRole('link', { name: /Where it came from/ }).click()
  await expect(page).toHaveURL(/where-it-came-from/)
  await page
    .locator('[data-pager]')
    .getByRole('link', { name: /What it is/ })
    .click()
  await expect(page).toHaveURL(/what-it-is/)
  // The ends of the line have only one direction.
  await page.goto('/two-machines/two-cycles/')
  expect(await page.locator('[data-pager] a').count()).toBe(1)
  await page.goto('/two-machines/listen/')
  expect(await page.locator('[data-pager] a').count()).toBe(1)
})
