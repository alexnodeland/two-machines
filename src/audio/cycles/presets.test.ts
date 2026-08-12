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
      expect(p?.source).toContain('meters only')
      for (const v of p?.voices ?? []) {
        expect(v.hits).toEqual([0])
      }
    }
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
    // steps, not a quotable figure (ADR-031).
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
    expect(preset.voices[0]?.hits).toEqual([0, 3])
    expect(preset.voices[0]?.timbre.freq).toBe(1950)
    expect(preset.voices[0]?.muted).toBe(false)
  })
})
