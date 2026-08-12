import { describe, expect, it } from 'vitest'
import {
  ageToCutoff,
  bytePeakLevel,
  byteRmsLevel,
  ageToHiss,
  ageToWow,
  clamp,
  dbToGain,
  decayTime,
  distanceToSeconds,
  feedbackState,
  gainToDb,
  midiToFreq,
  repeatsToInaudible,
  secondsToDistance,
  SPEEDS,
  vuSegments,
} from './curves'

describe('distanceToSeconds / secondsToDistance', () => {
  it('80 cm at 7½ ips is the 4.2 s default machine distance', () => {
    expect(distanceToSeconds(80, '7.5')).toBeCloseTo(4.1995, 3)
  })

  it('one second of tape at 7½ ips is 19.05 cm', () => {
    expect(distanceToSeconds(19.05, '7.5')).toBe(1)
    expect(secondsToDistance(1, '7.5')).toBe(19.05)
  })

  it('doubling the speed halves the delay for the same distance', () => {
    expect(distanceToSeconds(80, '15')).toBeCloseTo(distanceToSeconds(80, '7.5') / 2, 10)
    expect(distanceToSeconds(80, '3.75')).toBeCloseTo(
      distanceToSeconds(80, '7.5') * 2,
      10
    )
  })

  it('round-trips at every speed', () => {
    for (const speed of Object.keys(SPEEDS) as (keyof typeof SPEEDS)[]) {
      expect(secondsToDistance(distanceToSeconds(123.4, speed), speed)).toBeCloseTo(
        123.4,
        10
      )
    }
  })
})

describe('repeatsToInaudible', () => {
  it('is zero at or below zero feedback — one pass, then silence', () => {
    expect(repeatsToInaudible(0)).toBe(0)
    expect(repeatsToInaudible(-0.5)).toBe(0)
  })

  it('is Infinity at and past unity — that IS runaway, not an edge case', () => {
    expect(repeatsToInaudible(1)).toBe(Infinity)
    expect(repeatsToInaudible(1.18)).toBe(Infinity)
  })

  it('counts repeats to −60 dB below unity', () => {
    expect(repeatsToInaudible(0.85)).toBeCloseTo(42.505, 2)
    expect(repeatsToInaudible(0.5)).toBeCloseTo(9.966, 2)
  })

  it('rises monotonically toward unity', () => {
    expect(repeatsToInaudible(0.9)).toBeGreaterThan(repeatsToInaudible(0.8))
    expect(repeatsToInaudible(0.99)).toBeGreaterThan(repeatsToInaudible(0.9))
  })
})

describe('decayTime', () => {
  it('scales repeats by the machine spacing', () => {
    expect(decayTime(0.85, 4.2)).toBeCloseTo(repeatsToInaudible(0.85) * 4.2, 10)
  })

  it('is zero at zero feedback and Infinity at unity', () => {
    expect(decayTime(0, 4.2)).toBe(0)
    expect(decayTime(1, 4.2)).toBe(Infinity)
  })
})

describe('ageToCutoff', () => {
  it('spans 16 kHz fresh to 880 Hz fully worn', () => {
    expect(ageToCutoff(0)).toBe(16000)
    expect(ageToCutoff(1)).toBeCloseTo(880, 6)
  })

  it('clamps age outside 0..1', () => {
    expect(ageToCutoff(-1)).toBe(16000)
    expect(ageToCutoff(2)).toBeCloseTo(880, 6)
  })
})

describe('ageToWow / ageToHiss', () => {
  it('scale linearly with age and clamp', () => {
    expect(ageToWow(0.5)).toBeCloseTo(0.0011, 10)
    expect(ageToWow(2)).toBeCloseTo(0.0022, 10)
    expect(ageToWow(-1)).toBe(0)
    expect(ageToHiss(1)).toBeCloseTo(0.0075, 10)
    expect(ageToHiss(-1)).toBe(0)
  })
})

describe('dbToGain / gainToDb', () => {
  it('agree on the reference points', () => {
    expect(dbToGain(0)).toBe(1)
    expect(dbToGain(-20)).toBeCloseTo(0.1, 10)
    expect(gainToDb(1)).toBe(0)
    expect(gainToDb(0.1)).toBeCloseTo(-20, 10)
  })

  it('gainToDb is −Infinity at and below zero', () => {
    expect(gainToDb(0)).toBe(-Infinity)
    expect(gainToDb(-1)).toBe(-Infinity)
  })

  it('round-trips', () => {
    for (const db of [-48, -12, -6, 0, 6]) {
      expect(gainToDb(dbToGain(db))).toBeCloseTo(db, 10)
    }
  })
})

describe('midiToFreq', () => {
  it('is 440 at A4 and doubles per octave', () => {
    expect(midiToFreq(69)).toBe(440)
    expect(midiToFreq(81)).toBeCloseTo(880, 10)
    expect(midiToFreq(60)).toBeCloseTo(261.6256, 3)
  })
})

describe('vuSegments', () => {
  it('is dark below −48 dB', () => {
    expect(vuSegments(0)).toBe(0)
    expect(vuSegments(0.001)).toBe(0)
  })

  it('lights 11 of 12 at unity and pins at the top of the scale', () => {
    expect(vuSegments(1)).toBe(11)
    expect(vuSegments(2)).toBe(12)
    expect(vuSegments(3)).toBe(12) // clamped to 2 first
  })

  it('respects a custom segment count', () => {
    expect(vuSegments(1, 6)).toBe(5)
  })

  it('rises with level', () => {
    expect(vuSegments(0.01)).toBe(2)
    expect(vuSegments(0.1)).toBeGreaterThan(vuSegments(0.01))
  })
})

describe('feedbackState', () => {
  it('names each regime at its boundaries', () => {
    expect(feedbackState(0)).toBe('sparse')
    expect(feedbackState(0.3)).toBe('sparse')
    expect(feedbackState(0.35)).toBe('decaying')
    expect(feedbackState(0.71)).toBe('decaying')
    expect(feedbackState(0.72)).toBe('accumulating')
    expect(feedbackState(0.92)).toBe('accumulating')
    expect(feedbackState(0.93)).toBe('near unity')
    expect(feedbackState(0.99)).toBe('near unity')
    expect(feedbackState(1)).toBe('runaway')
    expect(feedbackState(1.18)).toBe('runaway')
  })
})

describe('bytePeakLevel', () => {
  it('reads silence as zero and full scale as one', () => {
    expect(bytePeakLevel(new Uint8Array(8).fill(128))).toBe(0)
    expect(bytePeakLevel([])).toBe(0)
    expect(bytePeakLevel([128, 0, 128])).toBe(1)
  })

  it('tracks the single loudest sample, either polarity', () => {
    expect(bytePeakLevel([128, 128 + 64, 128])).toBeCloseTo(0.5, 6)
    expect(bytePeakLevel([128, 128 - 64, 128 + 32])).toBeCloseTo(0.5, 6)
  })
})

describe('byteRmsLevel', () => {
  it('reads silence as zero', () => {
    expect(byteRmsLevel(new Uint8Array(64).fill(128))).toBe(0)
    expect(byteRmsLevel([])).toBe(0)
  })

  it('reads a full-scale square near 1', () => {
    const bytes = new Uint8Array(64)
    for (let i = 0; i < 64; i++) bytes[i] = i % 2 ? 0 : 255
    expect(byteRmsLevel(bytes)).toBeCloseTo(1, 1)
  })

  it('scales with amplitude', () => {
    const half = new Uint8Array(64).fill(128 + 64)
    expect(byteRmsLevel(half)).toBeCloseTo(0.5, 6)
  })
})

describe('clamp', () => {
  it('bounds on both sides and passes values inside', () => {
    expect(clamp(-1, 0, 1)).toBe(0)
    expect(clamp(0.5, 0, 1)).toBe(0.5)
    expect(clamp(2, 0, 1)).toBe(1)
  })
})
