import { expect, test } from '@playwright/test'

// Every link a reader can click, checked the way a reader clicks it
// (Plan-002, 15 Aug 2026 — "check all the links"). Internal links must
// resolve, every citation anchor must exist on /sources, and the citation
// journey must land the reader ON the entry, not at the top of a long
// bibliography. External URLs are the weekly link-check workflow's job —
// CI cannot depend on 60 third-party servers.

const PAGES = [
  '/two-machines/',
  '/two-machines/two-cycles/',
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
  '/two-machines/cycles/',
  '/two-machines/sources/',
  '/two-machines/colophon/',
]

test('every internal link on every page resolves', async ({ page }) => {
  const seen = new Map<string, string>()
  for (const p of PAGES) {
    await page.goto(p, { waitUntil: 'domcontentloaded' })
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') ?? '')
    )
    for (const h of hrefs) {
      if (h.startsWith('/') && !seen.has(h)) seen.set(h, p)
    }
  }
  const failures: string[] = []
  for (const [href, foundOn] of seen) {
    const path = href.split('#')[0]?.split('?')[0] ?? ''
    expect(
      path.startsWith('/two-machines'),
      `${href} on ${foundOn} carries the prefix`
    ).toBe(true)
    const resp = await page.request.get(path)
    if (resp.status() !== 200) failures.push(`${resp.status()} ${href} (on ${foundOn})`)
  }
  expect(failures).toEqual([])
})

test('every citation anchor exists on the sources page', async ({ page }) => {
  const anchors = new Set<string>()
  for (const p of PAGES) {
    await page.goto(p, { waitUntil: 'domcontentloaded' })
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll('a[href*="/sources/#"]')].map(
        (a) => a.getAttribute('href') ?? ''
      )
    )
    for (const h of hrefs) anchors.add(decodeURIComponent(h.split('#')[1] ?? ''))
  }
  expect(anchors.size).toBeGreaterThan(10) // the corpus is cited, site-wide
  await page.goto('/two-machines/sources/', { waitUntil: 'domcontentloaded' })
  const missing: string[] = []
  for (const id of anchors) {
    const exists = await page.evaluate((i) => document.getElementById(i) !== null, id)
    if (!exists) missing.push(id)
  }
  expect(missing).toEqual([])
})

test('clicking a citation lands the reader on the entry itself', async ({ page }) => {
  await page.goto('/two-machines/machine/what-it-is/')
  const cite = page.locator('main a[data-citation]').first()
  await cite.scrollIntoViewIfNeeded()
  await cite.click()
  await expect(page).toHaveURL(/\/sources\/#./)
  const landed = await page.evaluate(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    const el = document.getElementById(id)
    if (!el) return { found: false, inView: false }
    const r = el.getBoundingClientRect()
    return { found: true, inView: r.top >= -10 && r.top < window.innerHeight }
  })
  expect(landed).toEqual({ found: true, inView: true })
})

test('the gated sources carry a door that always opens', async ({ page }) => {
  await page.goto('/two-machines/sources/', { waitUntil: 'domcontentloaded' })
  const archived = page.getByRole('link', { name: 'archived copy' })
  // The two bot-gated archives (Michigan Daily, Open University) each offer
  // a Wayback fallback beside the canonical URL.
  await expect(archived).toHaveCount(2)
  for (const href of await archived.evaluateAll((as) =>
    as.map((a) => a.getAttribute('href'))
  )) {
    expect(href).toContain('web.archive.org')
  }
})
