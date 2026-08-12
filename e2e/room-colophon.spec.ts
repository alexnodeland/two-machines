import { expect, test } from '@playwright/test'

test('The Room carries the doctrine in Fripp’s words, no instrument', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/the-room/')
  await expect(page).toHaveTitle(/The Room/)
  await expect(page.getByText(/exerts an act of attention/)).toBeVisible()
  await expect(page.getByText(/the factor of hazard/).first()).toBeVisible()
  await expect(page.getByText(/pizza parlor/)).toBeVisible()
  expect(await page.locator('[data-instrument]').count()).toBe(0) // prose carries it
  expect(errors).toEqual([])
})

test('the colophon states the posture and reaches a person', async ({ page }) => {
  await page.goto('/two-machines/colophon/')
  await expect(page.getByText(/Unaffiliated with Robert Fripp/)).toBeVisible()
  await expect(page.getByText(/synthesised in your browser/)).toBeVisible()
  await expect(page.getByText(/MIT/)).toBeVisible()
  await expect(page.getByText(/CC BY-NC-SA 4.0/)).toBeVisible()
  await expect(page.locator('[data-contact] a')).toHaveAttribute(
    'href',
    'mailto:alex@ournature.studio'
  )
})

test('the index footer carries the statement site-wide', async ({ page }) => {
  await page.goto('/two-machines/')
  await expect(page.getByText(/used here\s+descriptively/)).toBeVisible()
  await page.getByRole('link', { name: 'Colophon' }).first().click()
  await expect(page).toHaveURL(/colophon/)
})
