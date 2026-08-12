import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// The axe leg of the Phase 6 accessibility pass (Plan-001), run against every
// page of the built prefixed output. WCAG 2.x A/AA rulesets; zero violations
// is the bar, so any future regression fails CI with the rule id in the diff.

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
  test(`axe finds no WCAG A/AA violations on ${path}`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const readable = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 3).map((n) => n.html),
    }))
    expect(readable).toEqual([])
  })
}
