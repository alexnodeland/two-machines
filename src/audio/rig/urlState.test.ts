import { describe, expect, it } from 'vitest'
import { defaultParams } from './params'
import { presetParams, RIG_PRESETS } from './presets'
import { decodeRigState, encodeRigState } from './urlState'

describe('encodeRigState', () => {
  it('a pristine rig shares as an empty string', () => {
    expect(encodeRigState(defaultParams())).toBe('')
  })

  it('encodes only what differs from the defaults', () => {
    const q = encodeRigState({ ...defaultParams(), feedback: 1.06, tapeAge: 0.5 })
    expect(q).toBe('fb=1.06&age=0.5')
  })

  it('encodes a non-default speed', () => {
    const q = encodeRigState({ ...defaultParams(), speed: '15' })
    expect(q).toBe('ips=15')
  })

  it('prints numbers without float noise', () => {
    const q = encodeRigState({ ...defaultParams(), feedback: 0.8500000001 })
    expect(q).toBe('fb=0.85')
  })
})

describe('decodeRigState', () => {
  it('round-trips every preset through the URL', () => {
    for (const p of RIG_PRESETS) {
      expect(decodeRigState(encodeRigState(p.params))).toEqual(p.params)
    }
  })

  it('loads a preset by id', () => {
    expect(decodeRigState('preset=mud')).toEqual(presetParams('mud'))
  })

  it('explicit params override the preset', () => {
    const p = decodeRigState('preset=mud&fb=0.5')
    expect(p.feedback).toBe(0.5)
    expect(p.recordHead).toBe(1.0) // still from the preset
  })

  it('an unknown preset id degrades to the defaults', () => {
    expect(decodeRigState('preset=nope')).toEqual(defaultParams())
  })

  it('a hand-edited URL can never reach an unsafe state', () => {
    const p = decodeRigState('fb=999&d=-3&rec=1e9&age=nope&ips=99&junk=1')
    expect(p.feedback).toBe(1.18) // clamped to the rail, not honoured
    expect(p.distanceSeconds).toBe(1.5)
    expect(p.recordHead).toBe(1.2)
    expect(p.tapeAge).toBe(0.35) // junk falls back to default
    expect(p.speed).toBe('7.5')
  })

  it('never throws, whatever the query', () => {
    for (const q of ['', '&&&', '=', 'preset', '%%%', 'fb']) {
      expect(() => decodeRigState(q)).not.toThrow()
    }
  })
})
