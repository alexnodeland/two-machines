import { describe, expect, it } from 'vitest'
import { canonLayout, canonRatio, canonVerdict, driftPhrase, FIGURE } from './canon'

describe('canonRatio', () => {
  it('reduces 3 s against 4 s to 3 : 4, returning after 12 s', () => {
    expect(canonRatio(3, 4)).toEqual({ a: 3, b: 4, returnSeconds: 12 })
  })

  it('a phrase equal to T is 1 : 1 and returns immediately', () => {
    expect(canonRatio(4, 4)).toEqual({ a: 1, b: 1, returnSeconds: 4 })
  })

  it('stays exact on the quarter-second grid', () => {
    expect(canonRatio(0.75, 4).returnSeconds).toBe(12)
    expect(canonRatio(1.25, 4)).toEqual({ a: 5, b: 16, returnSeconds: 20 })
  })
})

describe('canonVerdict', () => {
  it('locks when the phrase divides T evenly, counting the divisions', () => {
    expect(canonVerdict(2, 4)).toMatchObject({ locked: true, dividesTimes: 2 })
    expect(canonVerdict(4, 4)).toMatchObject({ locked: true, dividesTimes: 1 })
    expect(canonVerdict(1, 4)).toMatchObject({ locked: true, dividesTimes: 4 })
  })

  it('accumulates otherwise, pricing the realignment in phrases and passes', () => {
    const v = canonVerdict(3, 4)
    expect(v.locked).toBe(false)
    expect(v.phrases).toBe(4)
    expect(v.passes).toBe(3)
  })

  it('a phrase longer than T is not a lock', () => {
    expect(canonVerdict(8, 4).locked).toBe(false)
  })
})

describe('canonLayout', () => {
  it('draws four generations, dry first at full alpha', () => {
    const layout = canonLayout(3, 4)
    expect(layout.rows.map((r) => r.label)).toEqual(['YOU', '1T', '2T', '3T'])
    expect(layout.rows[0]?.alpha).toBe(1)
    expect(layout.rows[3]?.alpha).toBeCloseTo(0.72 ** 3, 10)
  })

  it('marks phrase starts and offsets each generation by T', () => {
    const layout = canonLayout(2, 4)
    const dry = layout.rows[0]?.marks ?? []
    expect(dry[0]).toEqual({ t: 0, isStart: true })
    expect(dry[1]).toEqual({ t: 0.5, isStart: false })
    expect(dry.filter((m) => m.isStart).length).toBeGreaterThan(1)
    expect((layout.rows[1]?.marks ?? [])[0]?.t).toBe(4)
  })

  it('keeps the last generation populated — span covers 3T plus phrases', () => {
    const layout = canonLayout(0.5, 4)
    expect(layout.span).toBeGreaterThanOrEqual(4 * 3 + 0.5)
    expect(layout.rows[3]?.marks.length).toBeGreaterThan(0)
  })

  it('caps the span at eight passes of the tape', () => {
    expect(canonLayout(7.75, 8).span).toBeLessThanOrEqual(64)
  })

  it('locked settings put a coincidence on every return; drifting ones do not', () => {
    const locked = canonLayout(2, 4)
    expect(locked.coincidences).toContain(4)
    expect(locked.coincidences).toContain(8)
    const drifting = canonLayout(3, 4)
    expect(drifting.coincidences).not.toContain(4)
    expect(drifting.coincidences).toContain(12)
  })

  it('rules every phrase start across the span', () => {
    const layout = canonLayout(3, 4)
    expect(layout.phraseRules[0]).toBe(0)
    expect(layout.phraseRules).toContain(3)
    expect(layout.phraseRules.length).toBe(Math.floor(layout.span / 3) + 1)
  })
})

describe('driftPhrase', () => {
  it('lands near three quarters of T, coprime with it', () => {
    expect(driftPhrase(4)).toBe(3.25)
    expect(canonVerdict(driftPhrase(4), 4).locked).toBe(false)
  })

  it('steps off the grid point when the natural choice would lock', () => {
    const p = driftPhrase(1.5)
    expect(canonVerdict(p, 1.5).locked).toBe(false)
  })

  it('respects the fader bounds', () => {
    expect(driftPhrase(8)).toBeLessThanOrEqual(8)
    expect(driftPhrase(1.5, 0.5, 8)).toBeGreaterThanOrEqual(0.5)
  })
})

describe('FIGURE', () => {
  it('is four plain intervals, root position first', () => {
    expect(FIGURE.length).toBe(4)
    expect(FIGURE[0]).toBe(0)
  })
})
