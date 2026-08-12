import { expect, test } from '@playwright/test'

// The rights compliance checklist (rights-and-legal §8), the parts that can
// be held structurally: no hosted audio anywhere (ADR-032), and the
// non-affiliation statement on every page.

const PAGES = [
  '/two-machines/',
  '/two-machines/two-cycles/',
  '/two-machines/cycles/',
  '/two-machines/machine/what-it-is/',
  '/two-machines/machine/where-it-came-from/',
  '/two-machines/machine/what-the-tape-does/',
  '/two-machines/machine/the-grammar/',
  '/two-machines/machine/the-four-modes/',
  '/two-machines/machine/building-it/',
  '/two-machines/discipline/where-the-numbers-come-from/',
  '/two-machines/discipline/rhythm/',
  '/two-machines/discipline/harmony/',
  '/two-machines/discipline/melody/',
  '/two-machines/the-room/',
  '/two-machines/listen/',
  '/two-machines/sources/',
  '/two-machines/colophon/',
]

for (const path of PAGES) {
  test(`no hosted audio and the statement present on ${path}`, async ({ page }) => {
    await page.goto(path)
    expect(await page.locator('audio, video').count()).toBe(0)
    await expect(page.getByText(/Unaffiliated with Robert Fripp/).first()).toBeVisible()
  })
}
