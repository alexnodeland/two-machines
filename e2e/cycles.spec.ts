import { expect, test } from '@playwright/test'

// The Cycles engine page, against the built prefixed output. The instrument
// runs on plain Web Audio (no quiver), so the full play path is testable in a
// real browser today.

test('the Cycles engine renders with the ADR-018 readout and the rights line', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/cycles/')
  await expect(page).toHaveTitle(/Cycles/)
  await expect(page.getByRole('group', { name: 'Readouts' })).toContainText('17 pulses')
  await expect(page.getByText(/a cycle length and a downbeat/)).toBeVisible()
  expect(errors).toEqual([])
})

test('audio starts only on a gesture, and the transport toggles', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/cycles/')
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible()
  await expect(page.getByText(/Playing\./)).toBeVisible()
  await page.getByRole('button', { name: 'Stop' }).click()
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible()
  expect(errors).toEqual([])
})

test('editing the rack clears the preset and updates the arithmetic', async ({
  page,
}) => {
  await page.goto('/two-machines/cycles/')
  await page.getByRole('button', { name: 'Five: longer cycle' }).click()
  await expect(page.getByRole('button', { name: 'Five against seven' })).toHaveAttribute(
    'aria-pressed',
    'false'
  )
  await expect(page.getByRole('group', { name: 'Readouts' })).toContainText('42 pulses')
})
