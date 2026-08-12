import { expect, test } from '@playwright/test'

// The prefix is the deployment detail most likely to ship broken (ADR-029,
// ADR-037): everything works in `gatsby develop` and 404s under
// /two-machines/ in production. These tests run against the built, prefixed
// output served by `gatsby serve --prefix-paths`.

test('the site renders at the prefix with no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', (err) => errors.push(String(err)))

  await page.goto('/two-machines/')
  await expect(page).toHaveTitle(/Two Machines/)
  await expect(page.getByLabel('The Rig')).toBeVisible()
  expect(errors).toEqual([])
})

test('the worklet and wasm resolve at the deployed prefix (ADR-037)', async ({
  request,
}) => {
  // This failure is invisible until someone presses play, days after deploy —
  // audio initialises on a gesture, so a 404 here never shows in a pageview.
  const worklet = await request.get('/two-machines/quiver.worklet.js')
  expect(worklet.status()).toBe(200)
  expect(await worklet.text()).toContain('registerProcessor')

  const wasm = await request.get('/two-machines/quiver_bg.wasm')
  expect(wasm.status()).toBe(200)
  const bytes = await wasm.body()
  // \0asm magic
  expect(Array.from(bytes.subarray(0, 4))).toEqual([0x00, 0x61, 0x73, 0x6d])
})

test('internal navigation stays under the prefix', async ({ page }) => {
  await page.goto('/two-machines/definitely-not-a-page/')
  await expect(page.locator('h1')).toContainText('Nothing on this reel')
  await page.getByRole('link', { name: 'Back to the start.' }).click()
  await expect(page).toHaveURL(/\/two-machines\/$/)
  await expect(page.getByLabel('The Rig')).toBeVisible()
})
