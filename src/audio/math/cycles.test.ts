import { describe, expect, it } from 'vitest'
import {
  coincidences,
  type CycleVoice,
  density,
  driftBeatSeconds,
  gcd,
  hitCount,
  isHit,
  lcm,
  lcmAll,
  longestGap,
  longestInterlock,
  phaseAt,
  pulsesToSeconds,
  returnPulses,
} from './cycles'

// Fixtures from Cycles engine §3 ("Worked values, for test fixtures"),
// themselves checked against the existing five-against-seven page — the
// source of the longestInterlock convention (ADR-018).

const downbeat = (cycle: number): CycleVoice => ({ cycle, hits: [0] })

/** The Dublin counting exercise: count five, clap on 1 and 4; count seven,
 * clap on 1, 4 and 6. */
const FIVE: CycleVoice = { cycle: 5, hits: [0, 3] }
const SEVEN: CycleVoice = { cycle: 7, hits: [0, 3, 5] }

describe('gcd / lcm / lcmAll', () => {
  it('computes the classics', () => {
    expect(gcd(15, 14)).toBe(1)
    expect(gcd(12, 18)).toBe(6)
    expect(lcm(5, 7)).toBe(35)
    expect(lcm(15, 14)).toBe(210)
    expect(lcmAll([15, 14, 17])).toBe(3570)
  })

  it('handles zeros and empties', () => {
    expect(gcd(0, 9)).toBe(9)
    expect(lcm(0, 9)).toBe(0)
    expect(lcmAll([])).toBe(0)
  })

  it('is sign-insensitive', () => {
    expect(gcd(-12, 18)).toBe(6)
    expect(lcm(-5, 7)).toBe(35)
  })

  it('property: lcm(a,b) · gcd(a,b) === a·b', () => {
    const pairs: [number, number][] = [
      [5, 7],
      [15, 14],
      [7, 6],
      [7, 8],
      [15, 8],
      [12, 18],
    ]
    for (const [a, b] of pairs) {
      expect(lcm(a, b) * gcd(a, b)).toBe(a * b)
    }
  })
})

describe('isHit', () => {
  it('sounds on its hit positions within the cycle', () => {
    expect(isHit(FIVE, 0)).toBe(true)
    expect(isHit(FIVE, 3)).toBe(true)
    expect(isHit(FIVE, 4)).toBe(false)
    expect(isHit(FIVE, 8)).toBe(true) // 8 % 5 = 3
  })

  it('wraps negative beats correctly — the ribbon draws before zero', () => {
    expect(isHit(FIVE, -5)).toBe(true) // ≡ 0
    expect(isHit(FIVE, -2)).toBe(true) // ≡ 3
    expect(isHit(FIVE, -1)).toBe(false) // ≡ 4
  })
})

describe('coincidences', () => {
  it('finds the six realignments of the clapping exercise in one orbit', () => {
    expect(coincidences([FIVE, SEVEN], 35)).toEqual([0, 3, 5, 10, 28, 33])
  })

  it('is empty with no voices', () => {
    expect(coincidences([], 35)).toEqual([])
  })

  it('property: invariant under voice reordering', () => {
    expect(coincidences([SEVEN, FIVE], 35)).toEqual(coincidences([FIVE, SEVEN], 35))
    const three = [downbeat(15), downbeat(14), downbeat(17)]
    const reversed = [...three].reverse()
    expect(coincidences(reversed, 3570)).toEqual(coincidences(three, 3570))
  })
})

describe('longestGap / longestInterlock — the ADR-018 convention', () => {
  it('five against seven: gap 18, interlock 17 — the UI prints 17', () => {
    expect(longestGap([FIVE, SEVEN], 35)).toBe(18)
    expect(longestInterlock([FIVE, SEVEN], 35)).toBe(17)
  })

  it('matches every worked-values row', () => {
    const rows: {
      voices: CycleVoice[]
      ret: number
      count: number
      interlock: number
    }[] = [
      { voices: [FIVE, SEVEN], ret: 35, count: 6, interlock: 17 },
      {
        voices: [downbeat(15), downbeat(14), downbeat(17)],
        ret: 3570,
        count: 1,
        interlock: 3569,
      },
      { voices: [downbeat(15), downbeat(14)], ret: 210, count: 1, interlock: 209 },
      { voices: [downbeat(7), downbeat(6)], ret: 42, count: 1, interlock: 41 },
      { voices: [downbeat(7), downbeat(8)], ret: 56, count: 1, interlock: 55 },
      { voices: [downbeat(15), downbeat(8)], ret: 120, count: 1, interlock: 119 },
    ]
    for (const { voices, ret, count, interlock } of rows) {
      const span = returnPulses(voices)
      expect(span).toBe(ret)
      expect(coincidences(voices, span)).toHaveLength(count)
      expect(longestInterlock(voices, span)).toBe(interlock)
    }
  })

  it('property: interlock is always gap − 1', () => {
    for (const voices of [
      [FIVE, SEVEN],
      [downbeat(15), downbeat(14)],
      [downbeat(7), downbeat(8)],
    ]) {
      const span = returnPulses(voices)
      expect(longestInterlock(voices, span)).toBe(longestGap(voices, span) - 1)
    }
  })

  it('returns the span when the voices never coincide', () => {
    const a: CycleVoice = { cycle: 2, hits: [0] }
    const b: CycleVoice = { cycle: 2, hits: [1] }
    expect(longestGap([a, b], 10)).toBe(10)
    expect(longestInterlock([a, b], 10)).toBe(9)
  })
})

describe('density / hitCount', () => {
  it('measures how full the texture is', () => {
    // five-and-seven clapping over one orbit: 14 + 15 pulses hit, minus overlaps
    const d = density([FIVE, SEVEN], 35)
    expect(d).toBeGreaterThan(0)
    expect(d).toBeLessThan(1)
    expect(density([downbeat(2)], 4)).toBe(0.5)
  })

  it('is zero over an empty span', () => {
    expect(density([FIVE], 0)).toBe(0)
  })

  it('counts hits over a span', () => {
    expect(hitCount(FIVE, 35)).toBe(14) // 2 per cycle × 7 cycles
    expect(hitCount(SEVEN, 35)).toBe(15) // 3 per cycle × 5 cycles
  })
})

describe('returnPulses / pulsesToSeconds', () => {
  it('the two numbers chapter 8 is built on', () => {
    const guitars = [downbeat(15), downbeat(14)]
    const all = [downbeat(15), downbeat(14), downbeat(17)]
    expect(returnPulses(guitars)).toBe(210)
    expect(returnPulses(all)).toBe(3570)
    // ≈48 s and ≈13½ minutes at 264 sixteenths/min
    expect(pulsesToSeconds(210, 264)).toBeCloseTo(47.7, 1)
    expect(pulsesToSeconds(3570, 264)).toBeCloseTo(811.4, 1)
  })
})

describe('driftBeatSeconds', () => {
  it('is Infinity when the rates match — offset, not drift', () => {
    expect(driftBeatSeconds(5, 120, 1, 1)).toBe(Infinity)
  })

  it('names the audible wave period otherwise', () => {
    expect(driftBeatSeconds(5, 60, 1, 1.1)).toBeCloseTo(50, 6)
  })
})

describe('phaseAt', () => {
  it('sweeps 0..1 across the voice cycle', () => {
    const v: CycleVoice = { cycle: 4, hits: [0] }
    expect(phaseAt(v, 0, 60)).toBe(0)
    expect(phaseAt(v, 1, 60)).toBe(0.25) // 1 beat of 4 at 60 bpm
    expect(phaseAt(v, 4, 60)).toBe(0) // full cycle wraps
  })

  it('a faster rate advances phase faster — this is drift', () => {
    const v: CycleVoice = { cycle: 4, hits: [0], rate: 2 }
    expect(phaseAt(v, 1, 60)).toBe(0.5)
  })
})
