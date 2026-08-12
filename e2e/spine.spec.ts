import { expect, test } from '@playwright/test'

// The spine (design-system §5, D-022): the ONE page-level effect, held to its
// own rules — present everywhere, decorative, never broken-looking when idle,
// red past unity, and honest under reduced motion.

test('every page carries exactly one spine, decorative and at its floor', async ({
  page,
}) => {
  for (const path of ['/two-machines/', '/two-machines/machine/what-it-is/']) {
    await page.goto(path)
    const spine = page.locator('[data-spine]')
    await expect(spine).toHaveCount(1)
    await expect(spine).toHaveAttribute('aria-hidden', 'true')
    // Idle floor: visible but faint — opacity resolves above zero.
    const opacity = await spine.evaluate((el) => Number(getComputedStyle(el).opacity))
    expect(opacity).toBeGreaterThan(0)
    expect(opacity).toBeLessThan(0.15)
  }
})

test('under reduced motion the heat still changes, without transition', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/two-machines/')
  const duration = await page
    .locator('[data-spine]')
    .evaluate((el) => getComputedStyle(el).transitionDuration)
  expect(duration).toBe('0s')
})

test('past unity the spine goes runaway-red with the live rig', async ({ page }) => {
  await page.goto('/two-machines/?fb=1.06')
  await page.getByRole('button', { name: /Tone pad/ }).dispatchEvent('pointerdown')
  await expect(page.getByText(/Audio running/)).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('html')).toHaveAttribute('data-spine-runaway', 'true')
  const colour = await page
    .locator('[data-spine]')
    .evaluate((el) => getComputedStyle(el).backgroundColor)
  expect(colour).toBe('rgb(226, 86, 74)') // --runaway
  // Pull back under unity: the flag clears while the heat stays live.
  await page.getByLabel(/Playback level/).fill('0.8')
  await expect(page.locator('html')).not.toHaveAttribute('data-spine-runaway', 'true')
  await page.getByRole('button', { name: /Tone pad/ }).dispatchEvent('pointerup')
})
