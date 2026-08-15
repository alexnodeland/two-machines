// The register spread (grammar lesson 4): "spread out of the middle
// register", measured. The fullness meter answers how much of the loop is
// spoken for; this model answers where — the same marks, the same decay law
// (loopFace.ts, imported not copied), split into the three bands the fifths
// ladder actually spans: C3 and G3 below middle C, the close steps D4–B4
// inside the middle octave, D5 and A5 above it. Pure functions of numbers.

import { markAmp, markLengthFrac, OCCUPANCY_FLOOR, type LoopMark } from './loopFace'

export type Register = 'low' | 'mid' | 'high'

export interface RegisterLevels {
  low: number
  mid: number
  high: number
}

/** The middle band: middle C (60) up through B4 (71) — the octave Lamont
 * warns about. Below is low, above is high. */
export const MIDDLE_FROM = 60
export const MIDDLE_TO = 71

export const registerOf = (midi: number): Register =>
  midi < MIDDLE_FROM ? 'low' : midi > MIDDLE_TO ? 'high' : 'mid'

/** Per-band occupancy, each clamped to 0..1: the same length-times-decay
 * weight the fullness meter sums, only sorted by where each note sits. */
export const registerLevels = (
  marks: readonly LoopMark[],
  now: number,
  period: number,
  feedback: number
): RegisterLevels => {
  const sums: Record<Register, number> = { low: 0, mid: 0, high: 0 }
  for (const m of marks) {
    sums[registerOf(m.midi)] +=
      markLengthFrac(m, now, period) * markAmp(m, now, period, feedback)
  }
  return {
    low: Math.min(1, sums.low),
    mid: Math.min(1, sums.mid),
    high: Math.min(1, sums.high),
  }
}

export type RegisterVerdict = 'empty' | 'crowded-middle' | 'leaning' | 'spread'

/** A band holding more than this share of the total dominates the loop. */
export const DOMINANT_SHARE = 0.6

/** The middle must carry at least this much absolute occupancy before its
 * dominance is called crowding — one quiet note is not a crowd. */
export const CROWDED_FLOOR = 0.2

/** The verdict vocabulary, kept small and honest: 'empty' (nothing to
 * judge), 'crowded-middle' (the middle dominates AND carries real weight —
 * the mud register), 'leaning' (one band dominates but it is not the crowded
 * middle), 'spread' (no band dominates). */
export const registerVerdict = (levels: RegisterLevels): RegisterVerdict => {
  const total = levels.low + levels.mid + levels.high
  if (total < OCCUPANCY_FLOOR) return 'empty'
  const top = Math.max(levels.low, levels.mid, levels.high)
  if (top <= DOMINANT_SHARE * total) return 'spread'
  if (levels.mid === top && levels.mid >= CROWDED_FLOOR) return 'crowded-middle'
  return 'leaning'
}

/** The one-line verdict under the bars; an empty loop stays silent. */
export const registerSay = (verdict: RegisterVerdict): string => {
  if (verdict === 'crowded-middle')
    return 'Everything is in the middle — the mud register.'
  if (verdict === 'spread') return 'Spread — low and high are carrying it.'
  if (verdict === 'leaning')
    return 'One register is carrying nearly all of it. Spreading out gives every note its own room.'
  return ''
}
