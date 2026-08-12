import { expect, test } from '@playwright/test'

test('the listening curriculum renders twelve outbound records, hosting nothing', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/listen/')
  await expect(page).toHaveTitle(/Listen/)
  await expect(page.getByText(/this page is a map, not a jukebox/)).toBeVisible()
  const externalLinks = page.locator(
    'a[href^="https://open.spotify.com"], a[href^="https://dgmlive.com"], a[href*="bandcamp.com"]'
  )
  expect(await externalLinks.count()).toBe(12)
  expect(await page.locator('audio, video').count()).toBe(0) // ADR-032, structurally
  expect(errors).toEqual([])
})

test('grammar lesson 3 carries the designed exercise, silent until pressed', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/the-grammar/')
  const exercise = page.locator('[data-instrument="not-committing"]')
  await expect(exercise).toHaveCount(1)
  await expect(exercise.getByText('Silent until you press the pad.')).toBeVisible()
  await expect(exercise.getByRole('button', { name: 'Not committing' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )

  // Press the pad: the REAL worklet boots on this page too, and the verdict
  // flips to the measuring voice.
  await exercise.getByRole('button', { name: /Tone pad/ }).dispatchEvent('pointerdown')
  await expect(exercise.getByText(/the tape is ignoring you/)).toBeVisible({
    timeout: 15_000,
  })
  await exercise.getByRole('button', { name: /Tone pad/ }).dispatchEvent('pointerup')
  await expect(exercise.getByRole('meter')).toBeVisible()
})

test('grammar lesson 2 plays the loop face against the real rig', async ({ page }) => {
  await page.goto('/two-machines/machine/the-grammar/')
  const band = page.locator('[data-instrument="beeping-droning"]')
  await expect(band).toBeVisible()
  await expect(band.locator('[data-face-period]')).toHaveText('4.00 s')
  await expect(band.getByText(/Tap a pad. Short and far apart/)).toBeVisible()
  // Switch gestures — pure UI, no boot needed.
  await band.getByRole('button', { name: /Droning/ }).click()
  await expect(band.getByText(/The arc grows for as long as you hold it/)).toBeVisible()
  // Hold a pad: the real worklet boots, the loop fills, the meter reads it.
  const padD = band.getByRole('button', { name: /^D3/ })
  await padD.dispatchEvent('pointerdown')
  await expect(band.locator('[data-mud-state]')).not.toHaveText('empty', {
    timeout: 15_000,
  })
  await padD.dispatchEvent('pointerup')
})
