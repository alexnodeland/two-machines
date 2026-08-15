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
  const pad = page.getByRole('button', { name: /^D3 —/ })
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
  // ≤1/128 is the powered-on tape's hiss floor (≈ −42 dB, tape age 0.35,
  // post-loop per ADR-047 §4) — the note and its tail must be gone.
  expect(await peak(page, 800)).toBeLessThanOrEqual(1)
})
