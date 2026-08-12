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
