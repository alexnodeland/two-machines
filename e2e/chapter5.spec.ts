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
  // The signal-path frame leads; the Sacred Songs claim stays chip-attributed.
  await expect(page.getByText(/what changes is the signal path/)).toBeVisible()
  await expect(page.getByText(/first recorded use of\s+Frippertronics/)).toBeVisible()
  expect(errors).toEqual([])

  const citations = page.locator('[data-citation="tamm-1990"]')
  expect(await citations.count()).toBeGreaterThanOrEqual(4)
  await page.goto('/two-machines/sources/')
  await expect(page.locator('#tamm-1990')).toBeVisible()
})

test('every mode is a routing the reader can play — four rig deep-links', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/the-four-modes/')
  // Pure: the diagram at its defaults — the accumulating posture.
  const pure = page.getByRole('link', { name: /open the rig at its defaults/ })
  await expect(pure).toBeVisible()
  await expect(pure).toHaveAttribute('href', /\/two-machines\/$/)
  // Applied: the loop as one voice under a dry line — nothing to tape.
  const applied = page.getByRole('link', {
    name: /drop the record head to zero and raise the monitor/,
  })
  await expect(applied).toBeVisible()
  await expect(applied).toHaveAttribute('href', /\?rec=0&mon=1/)
  // Discotronics: a short echo riding an outside clock.
  const disco = page.getByRole('link', {
    name: /shorten the tape and pull the playback down/,
  })
  await expect(disco).toBeVisible()
  await expect(disco).toHaveAttribute('href', /\?d=1\.5&fb=0\.35/)
  // Soundscapes: long tape, playback near unity — sustain.
  const sustain = page.getByRole('link', {
    name: /stretch the tape to eight seconds with playback near unity/,
  })
  await expect(sustain).toBeVisible()
  await expect(sustain).toHaveAttribute('href', /\?d=8&fb=0\.98/)
  // The links land on the rig with their query intact.
  await sustain.click()
  await expect(page).toHaveURL(/\/two-machines\/\?d=8&fb=0\.98/)
})
