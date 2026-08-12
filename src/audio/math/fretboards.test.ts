import { describe, expect, it } from 'vitest'
import {
  gripChanged,
  intervalName,
  pitchClassName,
  placeShape,
  SHAPES,
  soundingIntervals,
  stringSetCount,
  stringSetLabel,
  TUNINGS,
} from './fretboards'

describe('tunings', () => {
  it('spells NST as Fripp spelled it: fifths up from low C, G on top', () => {
    expect(TUNINGS.nst.midi.map(pitchClassName)).toEqual(['C', 'G', 'D', 'A', 'E', 'G'])
    const steps = TUNINGS.nst.midi
      .slice(1)
      .map((m, i) => m - (TUNINGS.nst.midi[i] as number))
    expect(steps).toEqual([7, 7, 7, 7, 3]) // four fifths, one minor third
  })

  it('standard tuning carries its lone major third at G–B', () => {
    const steps = TUNINGS.standard.midi
      .slice(1)
      .map((m, i) => m - (TUNINGS.standard.midi[i] as number))
    expect(steps).toEqual([5, 5, 5, 4, 5])
  })
})

describe('names', () => {
  it('names pitch classes across the wrap', () => {
    expect(pitchClassName(36)).toBe('C')
    expect(pitchClassName(61)).toBe('C♯')
    expect(pitchClassName(-1)).toBe('B')
  })

  it('names the intervals the shapes actually use', () => {
    expect(intervalName(7)).toBe('P5')
    expect(intervalName(5)).toBe('P4')
    expect(intervalName(4)).toBe('M3')
    expect(intervalName(3)).toBe('m3')
    expect(intervalName(12)).toBe('P8')
    expect(intervalName(-7)).toBe('P5')
  })
})

describe('placeShape', () => {
  it('a fifth on any NST fifth-pair is the open grip itself', () => {
    for (const s of [0, 1, 2, 3]) {
      expect(placeShape(TUNINGS.nst, SHAPES['fifths-dyad'], s).frets).toEqual([0, 0])
    }
  })

  it('the NST top pair re-fingers the fifth — the minor-third compromise', () => {
    expect(placeShape(TUNINGS.nst, SHAPES['fifths-dyad'], 4).frets).toEqual([0, 4])
  })

  it('standard tuning re-fingers the fifth at its G–B third', () => {
    expect(placeShape(TUNINGS.standard, SHAPES['fifths-dyad'], 0).frets).toEqual([0, 2])
    expect(placeShape(TUNINGS.standard, SHAPES['fifths-dyad'], 3).frets).toEqual([0, 3])
  })

  it('the quartal stack is one grip on NST fifth-sets and spans wider than standard', () => {
    const nst = placeShape(TUNINGS.nst, SHAPES['quartal-stack'], 0)
    expect(nst.frets).toEqual([4, 2, 0])
    const std = placeShape(TUNINGS.standard, SHAPES['quartal-stack'], 0)
    expect(std.frets).toEqual([0, 0, 0]) // a straight barre on fourths
  })

  it('the close triad is compact in standard and a stretch in NST', () => {
    const std = placeShape(TUNINGS.standard, SHAPES['close-triad'], 0)
    const nst = placeShape(TUNINGS.nst, SHAPES['close-triad'], 0)
    expect(nst.span).toBeGreaterThan(std.span)
    expect(nst.span).toBe(7)
  })

  it('sounding pitches preserve the interval structure exactly', () => {
    const p = placeShape(TUNINGS.nst, SHAPES['close-triad'], 2)
    expect((p.midi[1] as number) - (p.midi[0] as number)).toBe(4)
    expect((p.midi[2] as number) - (p.midi[0] as number)).toBe(7)
  })

  it('clamps the string set into range', () => {
    expect(placeShape(TUNINGS.nst, SHAPES['close-triad'], 99).startString).toBe(3)
    expect(placeShape(TUNINGS.nst, SHAPES['close-triad'], -1).startString).toBe(0)
  })
})

describe('set counting and labels', () => {
  it('a dyad has five homes, a triad four', () => {
    expect(stringSetCount(TUNINGS.nst, SHAPES['fifths-dyad'])).toBe(5)
    expect(stringSetCount(TUNINGS.nst, SHAPES['close-triad'])).toBe(4)
  })

  it('labels the set by its open strings, not by numbers', () => {
    const p = placeShape(TUNINGS.nst, SHAPES['fifths-dyad'], 0)
    expect(stringSetLabel(TUNINGS.nst, p)).toBe('C–G')
    const top = placeShape(TUNINGS.nst, SHAPES['fifths-dyad'], 4)
    expect(stringSetLabel(TUNINGS.nst, top)).toBe('E–G')
  })
})

describe('gripChanged', () => {
  it('NST holds the fifth grip through set 3 and breaks only at the top', () => {
    expect(gripChanged(TUNINGS.nst, SHAPES['fifths-dyad'], 3)).toBe(false)
    expect(gripChanged(TUNINGS.nst, SHAPES['fifths-dyad'], 4)).toBe(true)
  })

  it('standard tuning breaks the fifth grip at the G–B set', () => {
    expect(gripChanged(TUNINGS.standard, SHAPES['fifths-dyad'], 2)).toBe(false)
    expect(gripChanged(TUNINGS.standard, SHAPES['fifths-dyad'], 3)).toBe(true)
  })
})

describe('soundingIntervals', () => {
  it('names each adjacent interval of the voicing', () => {
    expect(soundingIntervals(SHAPES['fifths-dyad'])).toEqual(['P5'])
    expect(soundingIntervals(SHAPES['quartal-stack'])).toEqual(['P4', 'P4'])
    expect(soundingIntervals(SHAPES['close-triad'])).toEqual(['M3', 'm3'])
  })
})
