import { describe, expect, it } from 'vitest'
import { coincidences, longestInterlock, returnPulses } from '../math/cycles'
import { cloneVoices, CYCLES_PRESETS, getCyclesPreset } from './presets'

describe('CYCLES_PRESETS — Cycles engine §5 verbatim', () => {
  it('carries the seven presets', () => {
    expect(CYCLES_PRESETS.map((p) => p.id)).toEqual([
      'claps',
      'discipline',
      'frame',
      'thela',
      'indiscipline',
      'drift',
      'circulation',
    ])
  })

  it('claps is the Dublin exercise and reproduces the worked values', () => {
    const claps = getCyclesPreset('claps')
    expect(claps?.voices.map((v) => v.hits)).toEqual([
      [0, 3],
      [0, 3, 5],
    ])
    const voices = claps?.voices ?? []
    expect(returnPulses(voices)).toBe(35)
    expect(coincidences(voices, 35)).toHaveLength(6)
    expect(longestInterlock(voices, 35)).toBe(17)
  })

  it('every King Crimson preset carries a cycle length and a downbeat — nothing else (ADR-017/031)', () => {
    for (const id of ['discipline', 'frame', 'thela', 'indiscipline']) {
      const p = getCyclesPreset(id)
      if (!p) throw new Error(`${id} preset missing`)
      expect(p.source).toContain('meters only')
      for (const v of p.voices) {
        expect(v.hits).toEqual([0])
        // The rule, executable: no pitch line, ever. A KC preset is a meter,
        // not a part — the musicality pass must never reach these.
        expect(v.pitches).toBeUndefined()
        expect('pitches' in v).toBe(false)
      }
    }
  })

  it('the interlocking lines are ours alone, exactly as composed (Phase B)', () => {
    const claps = getCyclesPreset('claps')
    expect(claps?.voices.map((v) => v.pitches)).toEqual([
      [60, 62, 64, 67, 69], // Five: C4 D4 E4 G4 A4
      [48, 55, 57, 52, 50, 55, 48], // Seven: C3 G3 A3 E3 D3 G3 C3
    ])
    const drift = getCyclesPreset('drift')
    expect(drift?.voices.map((v) => v.pitches)).toEqual([
      [62, 64, 69, 71], // D4 E4 A4 B4
      [62, 64, 69, 71], // the same line at the drifted tempo
    ])
  })

  it('discipline reproduces the chapter-8 numbers', () => {
    const voices = getCyclesPreset('discipline')?.voices ?? []
    expect(voices.map((v) => v.cycle)).toEqual([15, 14, 17])
    expect(returnPulses(voices)).toBe(3570)
    expect(returnPulses(voices.slice(0, 2))).toBe(210)
  })

  it('drift is the only drift-mode preset, off by four per cent', () => {
    for (const p of CYCLES_PRESETS) {
      expect(p.mode).toBe(p.id === 'drift' ? 'drift' : 'offset')
    }
    const drift = getCyclesPreset('drift')
    expect(drift?.voices.map((v) => v.rate)).toEqual([1, 1.04])
  })

  it('offset presets run every voice at rate 1 — that is what offset means', () => {
    for (const p of CYCLES_PRESETS.filter((p) => p.mode === 'offset')) {
      for (const v of p.voices) expect(v.rate).toBe(1)
    }
  })

  it('voice colours follow the token order: brass, aqua, then the one sanctioned third accent', () => {
    const discipline = getCyclesPreset('discipline')
    expect(discipline?.voices.map((v) => v.colour)).toEqual([
      'brass',
      'aqua',
      'voice-three',
    ])
  })

  it('no preset has more than three voices — there is no fourth colour', () => {
    for (const p of CYCLES_PRESETS) {
      expect(p.voices.length).toBeLessThanOrEqual(3)
    }
  })

  it('circulation is three seats, one note each, partitioning the cycle', () => {
    const p = getCyclesPreset('circulation')
    if (!p) throw new Error('circulation preset missing')
    expect(p.view).toBe('dials')
    expect(p.mode).toBe('offset')
    expect(p.voices.length).toBe(3)
    // One hit per seat, and together they cover every beat exactly once —
    // the line belongs to the circle, not to any player.
    const beats = p.voices.flatMap((v) => v.hits).sort()
    expect(beats).toEqual([0, 1, 2])
    for (const v of p.voices) {
      expect(v.cycle).toBe(3)
      expect(v.hits.length).toBe(1)
    }
    // Generic pitch, not a piece: the note says so and the seats are register
    // steps, not a quotable figure (ADR-031). The registers sit on ladder
    // classes — G5, B5, E6 — but there is no line to quote.
    expect(p.voices.map((v) => v.timbre.freq)).toEqual([784, 988, 1319])
    expect(p.voices.every((v) => v.pitches === undefined)).toBe(true)
    expect(p.note).toMatch(/not a piece/)
    expect(p.source).toMatch(/sparsely/)
  })

  it('getCyclesPreset returns undefined for an unknown id', () => {
    expect(getCyclesPreset('nope')).toBeUndefined()
  })
})

describe('cloneVoices', () => {
  it('deep-copies so rack edits never mutate the preset (§8)', () => {
    const preset = getCyclesPreset('claps')
    if (!preset) throw new Error('claps preset missing')
    const copy = cloneVoices(preset)
    const first = copy[0]
    if (!first) throw new Error('empty clone')
    first.hits.push(4)
    first.timbre.freq = 1
    first.muted = true
    first.pitches?.push(99)
    expect(preset.voices[0]?.hits).toEqual([0, 3])
    expect(preset.voices[0]?.timbre.freq).toBe(1950)
    expect(preset.voices[0]?.muted).toBe(false)
    expect(preset.voices[0]?.pitches).toEqual([60, 62, 64, 67, 69])
  })

  it('clones an unpitched voice without inventing a pitches field', () => {
    const preset = getCyclesPreset('discipline')
    if (!preset) throw new Error('discipline preset missing')
    for (const v of cloneVoices(preset)) {
      expect('pitches' in v).toBe(false)
    }
  })
})
