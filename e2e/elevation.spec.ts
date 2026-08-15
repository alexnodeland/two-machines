import { expect, test } from '@playwright/test'

// Phase E of Plan-002, driven the way a reader would: the first-loop card
// checks itself off as the rig is actually played; the practice cards carry
// preset-derived settings and print clean.

test('the first loop, guided: drag, sound, raise — then the payoff', async ({ page }) => {
  await page.goto('/two-machines/')
  const card = page.locator('[data-first-loop]')
  await expect(card).toBeVisible()
  const steps = card.locator('[data-first-loop-steps] > li')
  for (let i = 0; i < 3; i++) {
    await expect(steps.nth(i)).toHaveAttribute('data-step-done', 'false')
  }

  // Step 1 — drag machine two. Raw mouse coordinates need a settled layout
  // (font swap reflows the prose above the bench) and the deck centred in the
  // viewport — a minimal scroll parks it under the fixed sound bar, which
  // would swallow the mousedown.
  const deck = page.locator('button[data-deck="play"]')
  await page.evaluate(() => document.fonts.ready)
  await deck.evaluate((el) => el.scrollIntoView({ block: 'center' }))
  const box = await deck.boundingBox()
  expect(box).not.toBeNull()
  const { x, y, width, height } = box as NonNullable<typeof box>
  await page.mouse.move(x + width / 2, y + height / 2)
  await page.mouse.down()
  await page.mouse.move(x + width / 2 + 80, y + height / 2, { steps: 8 })
  await page.mouse.up()
  await expect(steps.nth(0)).toHaveAttribute('data-step-done', 'true')

  // Step 2 — hold the pad until the engine truly sounds.
  const pad = page.getByRole('button', { name: /Tone pad/ })
  await pad.dispatchEvent('pointerdown')
  await expect(page.getByText(/Audio running/)).toBeVisible({ timeout: 60_000 })
  await pad.dispatchEvent('pointerup')
  await expect(steps.nth(1)).toHaveAttribute('data-step-done', 'true')

  // Step 3 — raise the playback level toward unity.
  await page.getByLabel(/Playback level/).fill('0.9')
  await expect(steps.nth(2)).toHaveAttribute('data-step-done', 'true')

  // The payoff line appears, pointing at Part I.
  await expect(card.getByText(/Now stop playing/)).toBeVisible()
  await expect(card.getByRole('link', { name: /two cycles/i })).toHaveAttribute(
    'href',
    /two-cycles/
  )

  // A completed card never returns.
  await page.reload()
  await expect(page.locator('[data-first-loop]')).toHaveCount(0)
})

test('the first-loop card dismisses quietly and stays dismissed', async ({ page }) => {
  await page.goto('/two-machines/')
  await page.getByRole('button', { name: /got it/i }).click()
  await expect(page.locator('[data-first-loop]')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('[data-first-loop]')).toHaveCount(0)
})

test('six practice cards close the grammar lessons, settings derived from the presets', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/the-grammar/')
  const cards = page.locator('[data-practice-card]')
  await expect(cards).toHaveCount(6)
  await expect(cards.nth(0)).toContainText('Lesson 1 · Three notes and silence')
  // Lesson 2's settings line, derived from the beeping preset at 7½ ips.
  await expect(cards.nth(1)).toContainText(
    '4.0 s of tape (76 cm at 7½ ips) · playback 0.78 · record head 0.9 · monitor 0.75 · tape age 0.34'
  )
  await expect(
    cards.nth(1).getByRole('link', { name: 'Open the rig with these settings' })
  ).toHaveAttribute('href', /\/two-machines\/\?preset=beeping$/)
  // The print affordance is visible on screen.
  await expect(page.locator('[data-print-note]')).toBeVisible()
})

test('a practice card deep link opens the rig with the lesson loaded', async ({
  page,
}) => {
  await page.goto('/two-machines/machine/the-grammar/')
  await page
    .locator('[data-practice-card]')
    .nth(1)
    .getByRole('link', { name: 'Open the rig with these settings' })
    .click()
  await expect(page).toHaveURL(/\?preset=beeping/)
  await expect(page.locator('p[data-readout]')).toContainText('4.00 s')
})

test('the bench sheet ends Building it with the authentic preset', async ({ page }) => {
  await page.goto('/two-machines/machine/building-it/')
  const sheet = page.locator('[data-practice-card]')
  await expect(sheet).toHaveCount(1)
  await expect(sheet).toContainText('The Revox-era numbers, on your bench')
  await expect(sheet).toContainText('3.2 s of tape (61 cm at 7½ ips)')
  await expect(sheet).toContainText('decaying, never static')
  await expect(
    sheet.getByRole('link', { name: 'Open the rig with these settings' })
  ).toHaveAttribute('href', /\?preset=authentic$/)
})

test('print strips the chrome and keeps the cards whole', async ({ page }) => {
  await page.goto('/two-machines/machine/the-grammar/')
  await page.emulateMedia({ media: 'print' })
  await expect(page.locator('[data-site-header]')).toBeHidden()
  await expect(page.locator('[data-soundbar]')).toBeHidden()
  await expect(page.locator('[data-pager]')).toBeHidden()
  await expect(page.locator('[data-print-note]')).toBeHidden()
  const firstCard = page.locator('[data-practice-card]').first()
  await expect(firstCard).toBeVisible()
  const style = await firstCard.evaluate((el) => {
    const s = getComputedStyle(el)
    return { breakInside: s.breakInside, borderColor: s.borderTopColor }
  })
  expect(style.breakInside).toBe('avoid')
  expect(style.borderColor).toBe('rgb(0, 0, 0)')
})
