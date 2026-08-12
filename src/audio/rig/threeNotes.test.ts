import { describe, expect, it } from 'vitest'
import {
  BLACK_KEYS,
  commitNote,
  heardReadout,
  initialState,
  instructionFor,
  intervalName,
  intervalOf,
  keyName,
  midiFor,
  shortIntervalName,
  silenceSay,
  SUGGESTIONS,
} from './threeNotes'

describe('the step machine', () => {
  it('any first note sets the key and moves to step two', () => {
    const s = commitNote(initialState(), 2) // D
    expect(s).toEqual({ step: 2, root: 2, played: [{ pc: 2, iv: 0 }] })
    expect(instructionFor(s)).toMatch(/You are in D\./)
  })

  it('the second and third notes record their interval from the root', () => {
    let s = commitNote(initialState(), 0) // C
    s = commitNote(s, 7) // G — a fifth
    expect(s.played[1]).toEqual({ pc: 7, iv: 7 })
    expect(instructionFor(s)).toMatch(/Resist the obvious/)
    s = commitNote(s, 0) // C again, an octave up at step 3
    expect(s.played[2]).toEqual({ pc: 0, iv: 12 })
    expect(s.step).toBe(4)
    expect(instructionFor(s)).toMatch(/Now stop\./)
  })

  it('after the third note the machine refuses further notes', () => {
    let s = initialState()
    for (const pc of [0, 4, 7, 9, 11]) s = commitNote(s, pc)
    expect(s.step).toBe(4)
    expect(s.played.length).toBe(3)
  })
})

describe('intervals and registers', () => {
  it('wraps intervals into an octave, except the deliberate octave at step 3', () => {
    expect(intervalOf(9, 0, 2)).toBe(3) // A up to C — minor third
    expect(intervalOf(0, 0, 2)).toBe(0)
    expect(intervalOf(0, 0, 3)).toBe(12)
    expect(intervalOf(null, 5, 2)).toBe(0)
  })

  it('step three plays an octave up so the octave is a distinct pad', () => {
    expect(midiFor(0, 1)).toBe(48)
    expect(midiFor(0, 3)).toBe(60)
  })

  it('names what the lesson lights up', () => {
    expect(SUGGESTIONS[2]).toEqual([3, 4, 7])
    expect(SUGGESTIONS[3]).toEqual([2, 11, 12])
    expect(intervalName(3)).toBe('minor third')
    expect(intervalName(99)).toBe('')
    expect(shortIntervalName(12)).toBe('8ve')
    expect(shortIntervalName(5)).toBe('')
  })

  it('spells the twelve keys with the black ones known', () => {
    expect(keyName(0)).toBe('C')
    expect(keyName(10)).toBe('A♯')
    expect(BLACK_KEYS).toEqual([1, 3, 6, 8, 10])
  })
})

describe('readouts', () => {
  it('lists what the tape heard with interval names after the first', () => {
    expect(heardReadout([])).toBe('—')
    expect(
      heardReadout([
        { pc: 9, iv: 0 },
        { pc: 0, iv: 3 },
      ])
    ).toBe('A  ·  C (minor third)')
  })

  it('escalates the silence coaching with time held', () => {
    expect(silenceSay(0)).toMatch(/record head is down/)
    expect(silenceSay(5)).toMatch(/Do not add anything yet/)
    expect(silenceSay(12)).toMatch(/decay is doing to the top end/)
    expect(silenceSay(20)).toMatch(/emotional character/)
    expect(silenceSay(30)).toMatch(/longer than most people manage/)
  })
})
