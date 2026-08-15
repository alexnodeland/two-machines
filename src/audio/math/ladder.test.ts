import { describe, expect, it } from 'vitest'
import { midiToFreq } from './curves'
import { LADDER, ladderFreq } from './ladder'

describe('LADDER', () => {
  it('is the eight-step fifths ladder, exactly as composed', () => {
    expect(LADDER.map((n) => [n.name, n.midi])).toEqual([
      ['C3', 48],
      ['G3', 55],
      ['D4', 62],
      ['E4', 64],
      ['A4', 69],
      ['B4', 71],
      ['D5', 74],
      ['A5', 81],
    ])
  })

  it('stays inside the NST open-string classes {C G D A E B} — no accidental', () => {
    const classes = new Set([0, 7, 2, 9, 4, 11]) // C G D A E B as pitch classes
    for (const note of LADDER) {
      expect(classes.has(note.midi % 12)).toBe(true)
    }
  })

  it('climbs strictly, wide enough to register as registers', () => {
    for (let i = 1; i < LADDER.length; i++) {
      const lo = LADDER[i - 1]
      const hi = LADDER[i]
      if (!lo || !hi) throw new Error('ladder rung missing')
      expect(hi.midi).toBeGreaterThan(lo.midi)
    }
  })

  it('ladderFreq is midiToFreq, not a second tuning table', () => {
    expect(ladderFreq(69)).toBe(440)
    for (const note of LADDER) {
      expect(ladderFreq(note.midi)).toBe(midiToFreq(note.midi))
    }
  })
})
