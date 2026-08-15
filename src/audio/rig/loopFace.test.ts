import { describe, expect, it } from 'vitest'
import {
  loopFaceState,
  mudReading,
  PAD_NOTES,
  pruneMarks,
  type LoopMark,
} from './loopFace'

describe('PAD_NOTES', () => {
  it('is the eight-pad fifths ladder with home-row keys', () => {
    expect(PAD_NOTES.length).toBe(8)
    expect(PAD_NOTES[0]).toEqual({ n: 'C3', midi: 48, key: 'a' })
    expect(PAD_NOTES[7]).toEqual({ n: 'A5', midi: 81, key: 'k' })
    expect(PAD_NOTES.map((p) => p.n)).toEqual([
      'C3',
      'G3',
      'D4',
      'E4',
      'A4',
      'B4',
      'D5',
      'A5',
    ])
    expect(PAD_NOTES.map((p) => p.key)).toEqual(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'])
  })
})

describe('loopFaceState', () => {
  it('places a beep where it was played, radially by pitch', () => {
    const marks: LoopMark[] = [{ start: 1, end: 1.05, midi: 48 }]
    const { arcs } = loopFaceState(marks, 2, 4, 0.78)
    expect(arcs[0]?.startFrac).toBeCloseTo(0.25, 10)
    expect(arcs[0]?.lengthFrac).toBeCloseTo(0.05 / 4, 10)
    expect(arcs[0]?.radiusFrac).toBe(0)
    expect(arcs[0]?.live).toBe(false)
  })

  it('keeps a held note live at full amplitude, growing with the hold', () => {
    const marks: LoopMark[] = [{ start: 0, end: null, midi: 81 }]
    const { arcs } = loopFaceState(marks, 1, 4, 0.78)
    expect(arcs[0]?.live).toBe(true)
    expect(arcs[0]?.amp).toBe(1)
    expect(arcs[0]?.lengthFrac).toBeCloseTo(0.25, 10)
    expect(arcs[0]?.radiusFrac).toBe(1)
  })

  it('a hold longer than one pass just fills the ring', () => {
    const marks: LoopMark[] = [{ start: 0, end: null, midi: 57 }]
    expect(loopFaceState(marks, 9, 4, 0.78).arcs[0]?.lengthFrac).toBe(1)
  })

  it('decays a released note by feedback per revolution', () => {
    const marks: LoopMark[] = [{ start: 0, end: 0.5, midi: 55 }]
    const { arcs } = loopFaceState(marks, 8, 4, 0.5)
    expect(arcs[0]?.amp).toBeCloseTo(0.25, 10) // two revolutions at 0.5
  })

  it('occupancy weighs arc length by amplitude and caps at 1.4', () => {
    const one: LoopMark[] = [{ start: 0, end: 1, midi: 55 }]
    expect(loopFaceState(one, 0.5, 4, 1).occupancy).toBeCloseTo(0.25, 3)
    const wall: LoopMark[] = Array.from({ length: 9 }, () => ({
      start: 0,
      end: null,
      midi: 55,
    }))
    expect(loopFaceState(wall, 5, 4, 1).occupancy).toBe(1.4)
  })
})

describe('pruneMarks', () => {
  it('keeps live marks forever and dead ones only while audible', () => {
    const marks: LoopMark[] = [
      { start: 0, end: null, midi: 50 },
      { start: 0, end: 0.2, midi: 55 },
    ]
    // At fb 0.5, the released mark falls under the 0.02 floor after ~6 revs.
    expect(pruneMarks(marks, 100, 4, 0.5).length).toBe(1)
    expect(pruneMarks(marks, 1, 4, 0.5).length).toBe(2)
  })
})

describe('mudReading', () => {
  it('names each regime at its boundaries', () => {
    expect(mudReading(0).state).toBe('empty')
    expect(mudReading(0.1).state).toBe('sparse')
    expect(mudReading(0.34).state).toBe('speaking')
    expect(mudReading(0.62).state).toBe('dense')
    expect(mudReading(0.85).state).toBe('mud')
  })

  it('goes mud-red at dense, matching the mockup threshold', () => {
    expect(mudReading(0.61).mud).toBe(false)
    expect(mudReading(0.62).mud).toBe(true)
  })

  it('escalates the prose with occupancy, ending at the fix', () => {
    expect(mudReading(0).say).toMatch(/Play a few notes/)
    expect(mudReading(0.2).say).toMatch(/get a grip/)
    expect(mudReading(0.5).say).toMatch(/Let the Power Fall/)
    expect(mudReading(0.9).say).toMatch(/Stop playing and let it thin out/)
  })
})
