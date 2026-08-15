// The fifths ladder (Plan-002 Phase B, the musicality pass): the site's one
// shared pitch vocabulary, drawn from New Standard Tuning's stacked fifths —
// C G D A E B climbing bottom to top. Eight steps wide enough that droning
// low and beeping up top stay legible against each other. Composed for this
// site, in the idiom: an original pad set, never a quoted line (ADR-031).
// Pure functions of numbers only (ADR-027).

import { midiToFreq } from './curves'

export interface LadderNote {
  /** Note name with octave, e.g. 'C3' — what the pad and its aria-name print. */
  name: string
  midi: number
}

/** The eight-pad ladder, low to high. Every class is one of NST's open
 * strings {C G D A E B}; the middle steps close into seconds and thirds so
 * held neighbours beat gently instead of sitting in bare fifths. */
export const LADDER: readonly LadderNote[] = [
  { name: 'C3', midi: 48 },
  { name: 'G3', midi: 55 },
  { name: 'D4', midi: 62 },
  { name: 'E4', midi: 64 },
  { name: 'A4', midi: 69 },
  { name: 'B4', midi: 71 },
  { name: 'D5', midi: 74 },
  { name: 'A5', midi: 81 },
]

/** Hz for a ladder step — one conversion, reused from curves, not duplicated. */
export function ladderFreq(midi: number): number {
  return midiToFreq(midi)
}
