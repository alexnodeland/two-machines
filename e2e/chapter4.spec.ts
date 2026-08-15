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

test('lessons 1, 4 and 5 debrief what the reader just heard (Plan-002 B)', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/the-grammar/')
  // Lesson 1: the tape made the key.
  await expect(
    page.getByText(/Your first note\s+became the key because the tape kept sounding it/)
  ).toBeVisible()
  // Lesson 4: the meter crossing into mud is the price being paid.
  await expect(
    page.getByText(/The moment the meter crossed into mud is the one to remember/)
  ).toBeVisible()
  await expect(page.getByText(/that was the price\s+being paid/)).toBeVisible()
  // Lesson 5: the meter names the softest possible entry.
  await expect(
    page.getByText(/The meter under the pad is naming your softest possible entry/)
  ).toBeVisible()
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

test('lesson 4 reads where the notes sit, not just how much', async ({ page }) => {
  // The register spread: the fullness meter stays, and three bars split the
  // same decaying occupancy by band. Playing only the middle of the ladder
  // must earn the crowded-middle verdict — the lesson's own failure, seen.
  await page.goto('/two-machines/machine/the-grammar/')
  const mud = page.locator('[data-instrument="avoiding-mud"]')
  for (const name of [/Low register/, /Middle register/, /High register/]) {
    await expect(mud.getByRole('meter', { name })).toBeVisible()
  }
  const verdict = mud.locator('[data-register-say]')
  await expect(verdict).toHaveAttribute('aria-live', 'polite')
  await expect(verdict).toHaveAttribute('data-register-verdict', 'empty')
  await expect(mud.getByText('Where the notes sit')).toBeVisible()

  // Only middle-register pads: hold D4 across half a pass, then tap E4.
  const d4 = mud.getByRole('button', { name: /^D4 —/ })
  await d4.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(1200)
  await d4.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })
  const e4 = mud.getByRole('button', { name: /^E4 —/ })
  await e4.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(300)
  await e4.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })

  await expect(verdict).toHaveAttribute('data-register-verdict', 'crowded-middle')
  await expect(mud.getByText(/the mud register/)).toBeVisible()
  await expect(mud.getByRole('meter', { name: /Middle register/ })).toHaveAttribute(
    'data-crowded',
    'true'
  )
  // The other dimension is still on the page: the fullness meter stayed.
  await expect(mud.getByText('How full the loop is')).toBeVisible()
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
