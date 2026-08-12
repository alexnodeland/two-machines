import { expect, test } from '@playwright/test'

// Chapter 3 against the built prefixed output, held to its planning doc's
// acceptance: per-section marks, sourced sentences cited, citations resolving
// to /sources anchors in one click, and never a mark and citation on the
// same claim.

test('chapter 3 renders with per-section marks and the verified quotation', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/machine/what-the-tape-does/')
  await expect(page).toHaveTitle(/What the tape does/)

  // Marked per section, not once at page level (the chapter plan's rule).
  expect(await page.locator('[data-editorial-mark]').count()).toBeGreaterThanOrEqual(5)

  // The chapter's central sourced item, verified verbatim 11 Aug 2026.
  await expect(page.getByText(/exquisite interstice/)).toBeVisible()
  expect(errors).toEqual([])
})

test('the canon band carries 3.1 with audio disabled', async ({ page }) => {
  // The chapter plan's acceptance: the point lands without sound — the
  // verdict and ratio are pure arithmetic, live before any audio boots.
  await page.goto('/two-machines/machine/what-the-tape-does/')
  const canon = page.locator('[data-instrument="canon"]')
  await expect(canon).toBeVisible()
  await expect(canon.getByText('accumulating')).toBeVisible()
  await expect(canon.locator('[data-ratio]')).toContainText('3 : 4')
  await canon.getByRole('button', { name: 'Make it lock' }).click()
  await expect(canon.getByText('phase-locked · a canon')).toBeVisible()
  // Accumulation is the other idiom, not failure — the drift verdict names
  // Riley's accumulator rather than an error state.
  await canon.getByRole('button', { name: 'Make it drift' }).click()
  await expect(canon.getByText(/Riley’s accumulator, not a loop/)).toBeVisible()
})

test('3.3 prices the fast line on the loop face, before any audio boots', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/what-the-tape-does/')
  const band = page.locator('[data-instrument="beeping-droning"]')
  await expect(band).toBeVisible()
  // The mud preset's numbers are on the faders and the face centre.
  await expect(band.locator('[data-face-period]')).toHaveText('3.00 s')
  await expect(band.getByText('0.96')).toBeVisible()
  await expect(band.getByText(/Play a few notes/)).toBeVisible()
  await expect(band.getByRole('meter')).toHaveAttribute('aria-valuenow', '0')
})

test('every citation resolves to a live /sources anchor in one click', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/what-the-tape-does/')
  const citations = page.locator('[data-citation]')
  const count = await citations.count()
  expect(count).toBeGreaterThanOrEqual(2)

  const keys: string[] = []
  for (let i = 0; i < count; i++) {
    keys.push((await citations.nth(i).getAttribute('data-citation')) ?? '')
  }

  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`[id="${key}"]`)).toBeVisible()
    await expect(page.locator(`[id="${key}"]`)).toContainText(
      /verified \d+ [A-Z][a-z]+ \d{4}/
    )
  }
})

test('no editorial mark carries a citation', async ({ page }) => {
  await page.goto('/two-machines/machine/what-the-tape-does/')
  // A mark that contains, or is contained by, a citation would launder
  // opinion into apparent fact (ADR-003). Assert structural separation.
  expect(await page.locator('[data-editorial-mark] [data-citation]').count()).toBe(0)
  expect(await page.locator('[data-citation] [data-editorial-mark]').count()).toBe(0)
})
