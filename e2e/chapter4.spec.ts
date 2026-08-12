import { expect, test } from '@playwright/test'

// Chapter 4 against the built prefixed output: six lessons, each deep-linking
// the Rig with a preset, quotes within budget resolving to /sources.

test('the grammar renders its six lessons with marks and citations', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/machine/the-grammar/')
  await expect(page).toHaveTitle(/The grammar/)
  for (const lesson of [
    'Three notes and silence',
    'Beeping and droning',
    'Not committing',
    'Avoiding mud',
    'Volume swells and soft attack',
    'Writing a structure',
  ]) {
    await expect(page.getByRole('heading', { name: new RegExp(lesson) })).toBeVisible()
  }
  await expect(page.getByText(/sonic equivalent of mud/)).toBeVisible()
  await expect(page.getByText(/organ drone in D/)).toBeVisible()
  expect(await page.locator('[data-editorial-mark]').count()).toBeGreaterThanOrEqual(2)
  expect(await page.locator('[data-editorial-mark] [data-citation]').count()).toBe(0)
  expect(errors).toEqual([])
})

test('a lesson deep-links the Rig with its preset loaded', async ({ page }) => {
  await page.goto('/two-machines/machine/the-grammar/')
  // Lesson 1 carries its own S card: four steps, twelve keys, silence pending.
  const card = page.locator('[data-instrument="three-notes"]')
  await expect(card).toBeVisible()
  await expect(card.getByText('1 · the key')).toBeVisible()
  await expect(card.getByText(/you are now in that key/)).toBeVisible()
  expect(await card.locator('[data-keys] button').count()).toBe(12)
  // Lesson 4's mud card opens aiming at failure, fader capped below unity.
  const mud = page.locator('[data-instrument="avoiding-mud"]')
  await expect(mud.getByText(/aim is failure/)).toBeVisible()
  await expect(mud.getByLabel('Playback level')).toHaveAttribute('max', '0.98')
  // Lesson 5's swells card waits for a measured arrival.
  const swells = page.locator('[data-instrument="swells"]')
  await expect(swells.getByText(/how steeply the sound arrives/)).toBeVisible()
  await expect(swells.getByText('0.60 s')).toBeVisible()
  // Lesson 6's plan card: six form hints, and a one-line plan is refused.
  const plan = page.locator('[data-instrument="sequence-plan"]')
  await expect(plan.getByLabel('Plan line 1')).toHaveAttribute(
    'placeholder',
    /^Establish/
  )
  await expect(plan.getByRole('button', { name: 'Perform the plan' })).toBeDisabled()
  await plan.getByLabel('Plan line 1').fill('establish a drone')
  await plan.getByLabel('Plan line 2').fill('wait for the fade')
  await plan.getByRole('button', { name: 'Perform the plan' }).click()
  await expect(plan.getByText(/Line 1 of 2/)).toBeVisible()
  await plan.getByRole('button', { name: 'Next line' }).click()
  await plan.getByRole('button', { name: 'Finish' }).click()
  await expect(plan.getByText(/2 moves in/)).toBeVisible()
  await page.getByRole('link', { name: /Open the rig with this lesson/ }).click()
  await expect(page).toHaveURL(/\?preset=three-notes/)
  // three-notes: 3.5 s of tape at 0.80 — applied and clamped-safe on read
  await expect(page.locator('p[data-readout]')).toContainText('3.50 s')
})

test('every chapter-4 citation resolves on /sources', async ({ page }) => {
  await page.goto('/two-machines/machine/the-grammar/')
  const citations = page.locator('[data-citation]')
  const count = await citations.count()
  expect(count).toBeGreaterThanOrEqual(4)
  const keys = new Set<string>()
  for (let i = 0; i < count; i++) {
    keys.add((await citations.nth(i).getAttribute('data-citation')) ?? '')
  }
  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`[id="${key}"]`)).toBeVisible()
  }
})
