import { expect, test, type Page } from '@playwright/test'

// The audio lifecycle (ADR-047), asserted the way the 14 Aug audit measured
// it: a tap on every context's destination, installed before any page code
// runs, so silence is a number and not a hope. One voice at a time; nothing
// survives navigation; the kill switch always lands silent.

const installTap = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const w = window as typeof window & {
      __ctxs: BaseAudioContext[]
      __peak: (ms: number) => Promise<number>
    }
    w.__ctxs = []
    const desc = Object.getOwnPropertyDescriptor(
      BaseAudioContext.prototype,
      'destination'
    ) as PropertyDescriptor & { get: () => AudioDestinationNode }
    Object.defineProperty(BaseAudioContext.prototype, 'destination', {
      configurable: true,
      get(this: BaseAudioContext & { __tap?: { node: GainNode; an: AnalyserNode } }) {
        if (!this.__tap) {
          const real = desc.get.call(this)
          const node = new GainNode(this)
          const an = new AnalyserNode(this, { fftSize: 2048 })
          node.connect(an)
          an.connect(real)
          this.__tap = { node, an }
          w.__ctxs.push(this)
        }
        return this.__tap.node as unknown as AudioDestinationNode
      },
    })
    w.__peak = async (ms: number) => {
      const t0 = performance.now()
      let peak = 0
      const buf = new Uint8Array(2048)
      while (performance.now() - t0 < ms) {
        for (const c of w.__ctxs) {
          const tap = (c as BaseAudioContext & { __tap?: { an: AnalyserNode } }).__tap
          if (!tap) continue
          tap.an.getByteTimeDomainData(buf)
          for (let i = 0; i < buf.length; i++) {
            const v = Math.abs((buf[i] ?? 128) - 128)
            if (v > peak) peak = v
          }
        }
        await new Promise((r) => setTimeout(r, 40))
      }
      return peak
    }
  })
}

const peak = (page: Page, ms: number): Promise<number> =>
  page.evaluate(
    (t) => (window as never as { __peak: (ms: number) => Promise<number> }).__peak(t),
    ms
  )

test('audio does not survive navigation — the leak that started Plan-002', async ({
  page,
}) => {
  await installTap(page)
  await page.goto('/two-machines/machine/what-the-tape-does/')
  const pad = page.getByRole('button', { name: /^C3 —/ })
  await pad.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(500)
  await pad.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })
  // The note is on the tape; leave mid-tail.
  await page.getByRole('link', { name: 'Listen' }).first().click()
  await expect(page).toHaveURL(/\/listen\/$/)
  // Give the fade its window, then require honest silence.
  await page.waitForTimeout(400)
  expect(await peak(page, 1200)).toBe(0)
})

test('starting one Cycles embed stops the other', async ({ page }) => {
  await page.goto('/two-machines/two-cycles/')
  const plays = page.locator('main button', { hasText: /^Play$/ })
  await plays.nth(0).click()
  await expect(page.locator('main button', { hasText: /^Stop$/ })).toHaveCount(1)
  // The second embed's Play is now the first visible "Play" → nth(0) again.
  await plays.nth(0).click()
  // Still exactly one transport running: the arbiter handed the voice over.
  await expect(page.locator('main button', { hasText: /^Stop$/ })).toHaveCount(1)
})

test('the sound bar names the voice and the kill switch lands silent', async ({
  page,
}) => {
  await installTap(page)
  await page.goto('/two-machines/')
  const bar = page.getByRole('group', { name: 'Sound' })
  await expect(bar.getByText('Silent')).toBeVisible()

  const pad = page.getByRole('button', { name: /Tone pad/ })
  await pad.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await expect(bar.getByText(/Sounding — The Rig/)).toBeVisible()
  await page.waitForTimeout(400)
  await pad.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })

  await bar.getByRole('button', { name: /Silence everything/ }).click()
  await expect(bar.getByText('Silent')).toBeVisible()
  await page.waitForTimeout(300)
  expect(await peak(page, 800)).toBe(0)
  // The context itself is suspended — the site-wide guarantee.
  expect(
    await page.evaluate(() =>
      (window as never as { __ctxs: BaseAudioContext[] }).__ctxs.map((c) => c.state)
    )
  ).toEqual(['suspended'])
})

test('the rig’s own stop button silences on the page', async ({ page }) => {
  await installTap(page)
  await page.goto('/two-machines/')
  const pad = page.getByRole('button', { name: /Tone pad/ })
  await pad.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(600)
  await pad.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })
  await page.getByRole('button', { name: /Stop the tape/ }).click()
  await page.waitForTimeout(300)
  // TRUE silence, not the hiss floor: since the played review, silence()
  // parks the fade stage at 0 — armed but muted — so a stopped rig cannot
  // even lay its tape-hiss bed until the next gesture re-arms it.
  expect(await peak(page, 800)).toBe(0)
})

test('a same-page handover then a stop lands truly silent (the overlapping-playgrounds defect)', async ({
  page,
}) => {
  // The client's report: "when I'm in one playground and then I start another
  // playground on the same page, the sounds are overlapping." Before the
  // silence contract, the silenced instrument re-armed its fade after the
  // wipe, and its post-loop hiss bed sounded UNDER the new holder — two beds
  // by the second handover. Now: play lesson 2, hand over to lesson 4, stop —
  // measured peak must be exactly 0.
  await installTap(page)
  await page.goto('/two-machines/machine/the-grammar/')
  const beepPad = page
    .locator('[data-instrument="beeping-droning"]')
    .getByRole('button', { name: /^C3 —/ })
  await beepPad.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(300)
  await beepPad.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })
  const mud = page.locator('[data-instrument="avoiding-mud"]')
  const mudPad = mud.getByRole('button', { name: /^C3 —/ })
  await mudPad.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  // The handover fade (60 ms) and the loser's wipe (120 ms) both land here.
  await page.waitForTimeout(300)
  await mudPad.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })
  await mud.getByRole('button', { name: /Stop the tape/ }).click()
  await page.waitForTimeout(400)
  expect(await peak(page, 800)).toBe(0)
})

test('a single 80 ms tap on a cold instrument still sounds (a tap always sounds)', async ({
  page,
}) => {
  // The client's report: "sometimes it tells me to play three notes, and then
  // I only hear two notes." A tap released while the worklet booted used to
  // be swallowed; now the note starts when boot resolves and is held to the
  // MIN_TAP_SECONDS floor.
  await installTap(page)
  await page.goto('/two-machines/machine/the-grammar/')
  const key = page
    .locator('[data-instrument="three-notes"]')
    .getByRole('button', { name: 'A', exact: true })
  await key.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true })
  await page.waitForTimeout(80)
  await key.dispatchEvent('pointerup', { pointerId: 1, bubbles: true })
  expect(await peak(page, 1500)).toBeGreaterThan(0)
})
