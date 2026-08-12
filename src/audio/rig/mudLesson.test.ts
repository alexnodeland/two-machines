import { describe, expect, it } from 'vitest'
import { CLEAR_AT, MUD_AT, mudLessonSay, nextMudPhase } from './mudLesson'

describe('the mud phase machine', () => {
  it('stays filling until the loop actually reaches mud', () => {
    expect(nextMudPhase('filling', 0.5)).toBe('filling')
    expect(nextMudPhase('filling', MUD_AT)).toBe('made-mud')
  })

  it('after mud, waits for the loop to thin to sparse before declaring cleared', () => {
    expect(nextMudPhase('made-mud', 0.5)).toBe('made-mud')
    expect(nextMudPhase('made-mud', CLEAR_AT - 0.01)).toBe('cleared')
  })

  it('cleared is terminal — refilling is a new run, not a relapse', () => {
    expect(nextMudPhase('cleared', 1.2)).toBe('cleared')
  })

  it('speaks to each phase, ending on both directions of the boundary', () => {
    expect(mudLessonSay('filling')).toMatch(/aim is failure/)
    expect(mudLessonSay('made-mud')).toMatch(/pull the playback level down/)
    expect(mudLessonSay('cleared')).toMatch(/crossed it both ways/)
  })
})
