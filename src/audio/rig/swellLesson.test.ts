import { describe, expect, it } from 'vitest'
import {
  ATTACK_DEFAULT,
  ATTACK_MAX,
  ATTACK_MIN,
  swellSay,
  swellVerdict,
  THUMP_RISE,
} from './swellLesson'

describe('swellVerdict', () => {
  it('waits until something has been committed', () => {
    expect(swellVerdict(0.5, false)).toBe('waiting')
    expect(swellVerdict(0, false)).toBe('waiting')
  })

  it('calls a steep rise a thump and a shallow one a swell', () => {
    expect(swellVerdict(THUMP_RISE, true)).toBe('thump')
    expect(swellVerdict(0.3, true)).toBe('thump')
    expect(swellVerdict(0.01, true)).toBe('swell')
  })

  it('the fader range runs from a pick to a pedal swell', () => {
    expect(ATTACK_MIN).toBeLessThan(0.01)
    expect(ATTACK_MAX).toBeGreaterThanOrEqual(1)
    expect(ATTACK_DEFAULT).toBeGreaterThan(ATTACK_MIN)
    expect(ATTACK_DEFAULT).toBeLessThan(ATTACK_MAX)
  })

  it('speaks to each verdict, naming the metronome danger', () => {
    expect(swellSay('waiting')).toMatch(/how steeply the sound arrives/)
    expect(swellSay('thump')).toMatch(/metronome you did not mean to start/)
    expect(swellSay('swell')).toMatch(/a tone, not a clock/)
  })
})
