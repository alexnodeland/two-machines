import { expect, test } from '@playwright/test'

// Chapter 1 against the built prefixed output: the mechanism in a few
// sentences and one diagram — the honest descendant of the sleeve artwork
// (Q-02, resolved), with a real text alternative.

test('what-it-is renders the mechanism, the diagram, and the not-a-loop point', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/machine/what-it-is/')
  await expect(page).toHaveTitle(/What it is/)

  const diagram = page.getByRole('img', { name: /Discreet Music signal path/ })
  await expect(diagram).toBeVisible()
  await expect(page.getByText('the delay line — a span of tape')).toBeVisible()
  await expect(page.getByText(/The tape is not a loop/)).toBeVisible()
  await expect(page.getByText(/recorded a second time/)).toBeVisible()
  expect(errors).toEqual([])
})

test('chapter-1 citations resolve and no mark carries one', async ({ page }) => {
  await page.goto('/two-machines/machine/what-it-is/')
  const citations = page.locator('[data-citation]')
  expect(await citations.count()).toBeGreaterThanOrEqual(2)
  expect(await page.locator('[data-editorial-mark] [data-citation]').count()).toBe(0)
  await page.goto('/two-machines/sources/')
  await expect(page.locator('#gaskin-1979')).toBeVisible()
})
