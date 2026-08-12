import { expect, test } from '@playwright/test'

// Chapter 5: four modes, every load-bearing date and claim Tamm-attributed.

test('the four modes render with Tamm-attributed claims resolving', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/machine/the-four-modes/')
  await expect(page).toHaveTitle(/The four modes/)
  for (const mode of ['Pure', 'Applied', 'Discotronics', 'Soundscapes']) {
    await expect(page.getByRole('heading', { name: mode })).toBeVisible()
  }
  // The claim that rests on Tamm alone is attributed in the prose itself.
  await expect(page.getByText(/the claim rests on him alone/)).toBeVisible()
  await expect(page.getByText(/first recorded use of Frippertronics/)).toBeVisible()
  expect(errors).toEqual([])

  const citations = page.locator('[data-citation="tamm-1990"]')
  expect(await citations.count()).toBeGreaterThanOrEqual(4)
  await page.goto('/two-machines/sources/')
  await expect(page.locator('#tamm-1990')).toBeVisible()
})
