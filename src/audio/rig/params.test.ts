import { describe, expect, it } from 'vitest'
import {
  clampParam,
  DEFAULT_SPEED,
  defaultParams,
  isTapeSpeed,
  PARAM_RANGES,
  type RigParamName,
  sanitizeParams,
} from './params'

describe('PARAM_RANGES', () => {
  it('matches Audio engine §3 verbatim', () => {
    expect(PARAM_RANGES.distanceSeconds).toEqual({ min: 1.5, max: 8, default: 4.2 })
    expect(PARAM_RANGES.feedback).toEqual({ min: 0, max: 1.18, default: 0.75 })
    expect(PARAM_RANGES.recordHead).toEqual({ min: 0, max: 1.2, default: 0.85 })
    expect(PARAM_RANGES.monitor).toEqual({ min: 0, max: 1.2, default: 0.85 })
    expect(PARAM_RANGES.loopOut).toEqual({ min: 0, max: 1.2, default: 0.95 })
    expect(PARAM_RANGES.tapeAge).toEqual({ min: 0, max: 1, default: 0.35 })
    expect(PARAM_RANGES.master).toEqual({ min: 0, max: 1.2, default: 0.9 })
    expect(DEFAULT_SPEED).toBe('7.5')
  })

  it('feedback range deliberately exceeds unity — runaway is a lesson', () => {
    expect(PARAM_RANGES.feedback.max).toBeGreaterThan(1)
  })
})

describe('clampParam', () => {
  it('clamps into range on both sides', () => {
    expect(clampParam('feedback', 2)).toBe(1.18)
    expect(clampParam('feedback', -1)).toBe(0)
    expect(clampParam('distanceSeconds', 0.1)).toBe(1.5)
    expect(clampParam('distanceSeconds', 100)).toBe(8)
  })

  it('passes in-range values through untouched', () => {
    expect(clampParam('feedback', 1.06)).toBe(1.06)
  })

  it('non-finite input falls back to the default, not an edge', () => {
    expect(clampParam('feedback', NaN)).toBe(0.75)
    expect(clampParam('distanceSeconds', Infinity)).toBe(4.2)
  })
})

describe('isTapeSpeed', () => {
  it('accepts the three Revox speeds and nothing else', () => {
    expect(isTapeSpeed('3.75')).toBe(true)
    expect(isTapeSpeed('7.5')).toBe(true)
    expect(isTapeSpeed('15')).toBe(true)
    expect(isTapeSpeed('33')).toBe(false)
    expect(isTapeSpeed('')).toBe(false)
  })
})

describe('sanitizeParams — the URL-safety contract', () => {
  it('returns the defaults for empty input', () => {
    expect(sanitizeParams({})).toEqual(defaultParams())
  })

  it('accepts numbers and numeric strings, clamped', () => {
    const p = sanitizeParams({ feedback: '9', distanceSeconds: 3 })
    expect(p.feedback).toBe(1.18)
    expect(p.distanceSeconds).toBe(3)
  })

  it('ignores unknown keys, junk values and empty strings', () => {
    const p = sanitizeParams({
      feedback: 'loud',
      distanceSeconds: '',
      hack: 1000,
      speed: 'fast',
    })
    // 'loud' → NaN → default; '' ignored; unknown key dropped; bad speed dropped
    expect(p.feedback).toBe(0.75)
    expect(p.distanceSeconds).toBe(4.2)
    expect(p.speed).toBe('7.5')
    expect('hack' in p).toBe(false)
  })

  it('accepts a valid speed', () => {
    expect(sanitizeParams({ speed: '15' }).speed).toBe('15')
  })

  it('ignores non-string, non-number values', () => {
    const p = sanitizeParams({ feedback: { evil: true }, monitor: null })
    expect(p.feedback).toBe(0.75)
    expect(p.monitor).toBe(0.85)
  })

  it('property: output is always fully in range, whatever comes in', () => {
    const hostile = [
      { feedback: 1e9, recordHead: -1e9, tapeAge: 2, master: '999' },
      { distanceSeconds: -0, loopOut: 'NaN', monitor: '1e308' },
    ]
    for (const input of hostile) {
      const p = sanitizeParams(input)
      for (const name of Object.keys(PARAM_RANGES) as RigParamName[]) {
        expect(p[name]).toBeGreaterThanOrEqual(PARAM_RANGES[name].min)
        expect(p[name]).toBeLessThanOrEqual(PARAM_RANGES[name].max)
      }
    }
  })
})
