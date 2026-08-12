import { describe, expect, it } from 'vitest'
import { defaultParams, PARAM_RANGES, type RigParamName } from './params'
import { getPreset, presetParams, RIG_PRESETS } from './presets'

describe('RIG_PRESETS — Audio engine §9 verbatim', () => {
  it('carries all eight presets in chapter order', () => {
    expect(RIG_PRESETS.map((p) => p.id)).toEqual([
      'default',
      'three-notes',
      'beeping',
      'not-committing',
      'mud',
      'swells',
      'runaway',
      'authentic',
    ])
  })

  it('spot-checks the table values', () => {
    expect(getPreset('default')?.params).toEqual(defaultParams())
    const notCommitting = getPreset('not-committing')?.params
    expect(notCommitting?.recordHead).toBe(0) // the split: nothing enters the loop
    expect(notCommitting?.distanceSeconds).toBe(4.5)
    const mud = getPreset('mud')?.params
    expect(mud?.feedback).toBe(0.96)
    expect(mud?.recordHead).toBe(1.0)
    const runaway = getPreset('runaway')?.params
    expect(runaway?.feedback).toBe(1.06) // past unity, safely — within the 1.18 rail
  })

  it('every preset is fully within the safe ranges', () => {
    for (const p of RIG_PRESETS) {
      for (const name of Object.keys(PARAM_RANGES) as RigParamName[]) {
        expect(p.params[name]).toBeGreaterThanOrEqual(PARAM_RANGES[name].min)
        expect(p.params[name]).toBeLessThanOrEqual(PARAM_RANGES[name].max)
      }
    }
  })
})

describe('presetParams', () => {
  it('resolves a known id', () => {
    expect(presetParams('mud').feedback).toBe(0.96)
  })

  it('degrades an unknown id to the default rig — bad deep links never error', () => {
    expect(presetParams('does-not-exist')).toEqual(defaultParams())
  })
})
