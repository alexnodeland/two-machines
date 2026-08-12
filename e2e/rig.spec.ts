import { expect, test } from '@playwright/test'

// The Rig on the index page, against the built prefixed output. The pad test
// is the deep one: pressing it boots the REAL quiver worklet — wasm fetched
// at the prefix, tape_delay patch built and compiled inside the
// AudioWorklet — so a green run here means the whole audio pipeline stands.

test('the Rig renders silently with the default distance', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/')
  await expect(
    page.locator('p[data-readout]').filter({ hasText: /80\.0 cm · 4\.20 s/ })
  ).toBeVisible()
  await expect(page.getByText(/Silent until you press the pad/)).toBeVisible()
  expect(errors).toEqual([])
})

test('dragging machine two changes the delay and the URL', async ({ page }) => {
  await page.goto('/two-machines/')
  const deck = page.getByRole('button', { name: /Machine two — drag/ })
  const box = await deck.boundingBox()
  if (!box) throw new Error('deck has no box')
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2, { steps: 5 })
  await page.mouse.up()
  await expect(
    page.locator('p[data-readout]').filter({ hasText: /90\.0 cm/ })
  ).toBeVisible()
  expect(page.url()).toContain('d=4.72')
})

test('keyboard walks the deck', async ({ page }) => {
  await page.goto('/two-machines/')
  await page.getByRole('button', { name: /Machine two — drag/ }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(
    page.locator('p[data-readout]').filter({ hasText: /81\.0 cm/ })
  ).toBeVisible()
})

test('a hand-edited URL is clamped, never honoured', async ({ page }) => {
  await page.goto('/two-machines/?fb=999&d=0.1')
  const readout = page.locator('p[data-readout]')
  await expect(readout).toContainText('1.50 s')
  await expect(readout).toContainText('∞ repeats — runaway')
})

test('pressing the pad boots the real quiver worklet and sounds', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(String(err)))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })

  await page.goto('/two-machines/')
  const pad = page.getByRole('button', { name: /Tone pad/ })
  await pad.dispatchEvent('pointerdown')
  // "Audio running" appears only after createQuiverAudioNode resolved: the
  // worklet module loaded at the prefix, the wasm compiled, the tape_delay
  // patch built and the engine compile() acknowledged.
  await expect(page.getByText(/Audio running/)).toBeVisible({ timeout: 30_000 })
  await expect(pad).toHaveText('Sounding')
  // The meters exist only once audio is live: two VUs and the tape trace.
  await expect(page.getByRole('meter', { name: 'Into the machines' })).toBeVisible()
  await expect(page.getByRole('meter', { name: 'What the room hears' })).toBeVisible()
  await expect(page.getByLabel(/scrolling trace of the loop level/)).toBeVisible()
  await pad.dispatchEvent('pointerup')
  await expect(pad).toHaveText('Tone pad')
  expect(errors).toEqual([])
})
