import { describe, expect, it } from 'vitest'
import { LADDER } from '../math/ladder'
import { loopFaceState, type LoopMark } from './loopFace'
import {
  CROWDED_FLOOR,
  DOMINANT_SHARE,
  MIDDLE_FROM,
  MIDDLE_TO,
  registerLevels,
  registerOf,
  registerSay,
  registerVerdict,
} from './registerSpread'

const mark = (midi: number, start: number, end: number | null): LoopMark => ({
  start,
  end,
  midi,
})

describe('registerOf', () => {
  it('splits at middle C and above B4, boundaries included in the middle', () => {
    expect(registerOf(MIDDLE_FROM - 1)).toBe('low')
    expect(registerOf(MIDDLE_FROM)).toBe('mid')
    expect(registerOf(MIDDLE_TO)).toBe('mid')
    expect(registerOf(MIDDLE_TO + 1)).toBe('high')
  })

  it('places the fifths ladder as the lesson teaches: two low, four middle, two high', () => {
    const bands = LADDER.map((note) => registerOf(note.midi))
    expect(bands).toEqual(['low', 'low', 'mid', 'mid', 'mid', 'mid', 'high', 'high'])
  })
})

describe('registerLevels', () => {
  it('sums each band with the same weight the fullness meter uses', () => {
    // One live note per band, each covering a third of a 3 s pass.
    const marks = [mark(48, 0, null), mark(64, 0, null), mark(74, 0, null)]
    const levels = registerLevels(marks, 1, 3, 0.9)
    expect(levels.low).toBeCloseTo(1 / 3, 10)
    expect(levels.mid).toBeCloseTo(1 / 3, 10)
    expect(levels.high).toBeCloseTo(1 / 3, 10)
    // The bands partition the very occupancy the mud meter reads.
    const { occupancy } = loopFaceState(marks, 1, 3, 0.9)
    expect(levels.low + levels.mid + levels.high).toBeCloseTo(occupancy, 10)
  })

  it('decays a released note by the feedback ratio every revolution — the shared law', () => {
    // A 1 s note released at t=1; two revolutions later at 0.5 feedback:
    // (1/3 of the pass) × 0.5² — identical to the loop-face amplitude.
    const marks = [mark(62, 0, 1)]
    const levels = registerLevels(marks, 6, 3, 0.5)
    expect(levels.mid).toBeCloseTo((1 / 3) * 0.25, 10)
    expect(levels.low).toBe(0)
    expect(levels.high).toBe(0)
  })

  it('clamps a band at 1 — a pile-up cannot push the bar past full', () => {
    const marks = [mark(62, 0, null), mark(64, 0, null)]
    expect(registerLevels(marks, 2.9, 3, 0.96).mid).toBe(1)
  })
})

describe('registerVerdict', () => {
  it('calls the loop empty below the shared occupancy floor', () => {
    expect(registerVerdict({ low: 0, mid: 0, high: 0 })).toBe('empty')
    expect(registerVerdict({ low: 0.005, mid: 0.005, high: 0.005 })).toBe('empty')
  })

  it('calls it spread while no band holds more than the dominant share', () => {
    expect(registerVerdict({ low: 0.3, mid: 0, high: 0.3 })).toBe('spread')
    // Exactly at the share is still spread — dominance must be earned.
    expect(registerVerdict({ low: 0.2, mid: DOMINANT_SHARE, high: 0.2 })).toBe('spread')
  })

  it('calls the middle crowded only when it dominates AND carries real weight', () => {
    expect(registerVerdict({ low: 0.19, mid: 0.61, high: 0.2 })).toBe('crowded-middle')
    expect(registerVerdict({ low: 0, mid: 1, high: 0 })).toBe('crowded-middle')
    // Dominant but featherweight: one quiet middle note is not a crowd.
    expect(registerVerdict({ low: 0, mid: CROWDED_FLOOR - 0.01, high: 0.03 })).toBe(
      'leaning'
    )
    expect(registerVerdict({ low: 0, mid: CROWDED_FLOOR, high: 0.03 })).toBe(
      'crowded-middle'
    )
  })

  it('calls a dominant low or high band leaning — a low drone is not mud', () => {
    expect(registerVerdict({ low: 0.8, mid: 0.05, high: 0 })).toBe('leaning')
    expect(registerVerdict({ low: 0, mid: 0.1, high: 0.9 })).toBe('leaning')
  })
})

describe('registerSay', () => {
  it('speaks each verdict, and stays silent over an empty loop', () => {
    expect(registerSay('crowded-middle')).toMatch(/the mud register/)
    expect(registerSay('spread')).toMatch(/low and high are carrying it/)
    expect(registerSay('leaning')).toMatch(/its own room/)
    expect(registerSay('empty')).toBe('')
  })
})
