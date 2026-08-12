import { expect, test } from '@playwright/test'

// Chapters 9 and 10: the tuning and the line.

test('the tuning keeps the mark/hedge split exact', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/discipline/harmony/')
  await expect(page).toHaveTitle(/The tuning/)
  await expect(page.getByText(/perfect fifths upward from the low C/)).toBeVisible()
  // The resonance is marked ours; the intent question stays a question.
  await expect(page.getByText(/a question, not a claim/)).toBeVisible()
  expect(await page.locator('[data-editorial-mark]').count()).toBeGreaterThanOrEqual(2)
  expect(await page.locator('[data-editorial-mark] [data-citation]').count()).toBe(0)
  expect(errors).toEqual([])
})

test('the fretboards demonstrate the regular tuning, in interval vocabulary only', async ({
  page,
}) => {
  await page.goto('/two-machines/discipline/harmony/')
  const boards = page.locator('[data-instrument="fretboards"]')
  await expect(boards).toBeVisible()
  await expect(boards.getByText('A bare fifth: P5')).toBeVisible()
  // Drag the fifth to standard tuning's G–B pair: standard mutates, NST holds.
  const up = boards.getByRole('button', { name: 'Higher strings' })
  await up.click()
  await up.click()
  await up.click()
  await expect(boards.getByText(/Standard tuning just re-fingered/)).toBeVisible()
  // ADR-031: interval names only — no fret numbers anywhere on the surface.
  const text = (await boards.textContent()) ?? ''
  expect(text.replace(/[PmM][1-8]|TT/g, '')).not.toMatch(/\d/)
})

test('the line admits its thinness on the page', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  await page.goto('/two-machines/discipline/melody/')
  await expect(page).toHaveTitle(/The line/)
  await expect(page.getByText(/thinnest chapter on the site/)).toBeVisible()
  await expect(page.getByText(/honest beats thick/)).toBeVisible()
  await expect(
    page.getByText(/blossom into the most spectacular polyphonic/)
  ).toBeVisible()
  expect(errors).toEqual([])
})

test('the circulation opens on the dials ring and stays generic', async ({ page }) => {
  await page.goto('/two-machines/discipline/melody/')
  const cycles = page.locator('[data-instrument="cycles"]')
  await expect(cycles).toBeVisible()
  await expect(cycles.getByRole('button', { name: 'dials' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  // Three seats, one beat each — the rack shows the partition, not a piece.
  await expect(cycles.getByRole('button', { name: 'Seat one: beat 1' })).toHaveAttribute(
    'aria-pressed',
    'true'
  )
  await expect(
    cycles.getByRole('button', { name: 'Seat three: beat 3' })
  ).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText(/not a piece/).first()).toBeVisible()
})

test('chapter 9-10 citations resolve', async ({ page }) => {
  const keys = new Set<string>()
  for (const path of [
    '/two-machines/discipline/harmony/',
    '/two-machines/discipline/melody/',
  ]) {
    await page.goto(path)
    const citations = page.locator('[data-citation]')
    const count = await citations.count()
    expect(count).toBeGreaterThanOrEqual(2)
    for (let i = 0; i < count; i++) {
      keys.add((await citations.nth(i).getAttribute('data-citation')) ?? '')
    }
  }
  await page.goto('/two-machines/sources/')
  for (const key of keys) {
    await expect(page.locator(`#${key}`)).toBeVisible()
  }
})
