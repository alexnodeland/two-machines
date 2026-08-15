// The canon arithmetic for chapter 3.1 (docs/chapters/03-what-the-tape-does.md):
// a delay line is a perpetual canon at the unison, and the only free parameter
// left to the player is phrase length. Both controls step in 0.25 s, so every
// ratio is rational and the return time is exact — which is the honest way to
// teach this (mockups/m-canon.html is the behavioural ancestor; ADR-016 makes
// it the same arithmetic as Part I's offset/drift distinction).

import { gcd, lcm } from './cycles'

/** Quarter-second grid: the resolution both faders step on. */
const quarters = (seconds: number): number => Math.round(seconds * 4)

export interface CanonRatio {
  /** Phrase : delay in lowest terms. */
  a: number
  b: number
  /** When the whole pattern first realigns with its own start. */
  returnSeconds: number
}

export const canonRatio = (phraseSeconds: number, delaySeconds: number): CanonRatio => {
  const p = quarters(phraseSeconds)
  const d = quarters(delaySeconds)
  const g = gcd(p, d)
  return { a: p / g, b: d / g, returnSeconds: lcm(p, d) / 4 }
}

export interface CanonVerdict {
  locked: boolean
  ratio: CanonRatio
  /** When locked: how many times the phrase divides T. */
  dividesTimes: number
  /** When accumulating: the realignment cost, in phrases and tape passes. */
  phrases: number
  passes: number
}

export const canonVerdict = (
  phraseSeconds: number,
  delaySeconds: number
): CanonVerdict => {
  const ratio = canonRatio(phraseSeconds, delaySeconds)
  const locked = quarters(delaySeconds) % quarters(phraseSeconds) === 0
  return {
    locked,
    ratio,
    dividesTimes: locked ? Math.round(delaySeconds / phraseSeconds) : 0,
    phrases: Math.round(ratio.returnSeconds / phraseSeconds),
    passes: Math.round(ratio.returnSeconds / delaySeconds),
  }
}

export interface FigureNote {
  midi: number
  /** Relative length in beats of the phrase — the A holds double, the B
   * passes quickly. */
  beats: number
}

/** The five-note phrase, composed for this site from the fifths ladder
 * (ours, in the idiom — an original figure, not a quotable part, ADR-031):
 * rise, hold, fall — D4, E4, then A4 held twice as long as the others, a
 * brief B4, resolving down to A3. A line worth hearing return. */
export const FIGURE: readonly FigureNote[] = [
  { midi: 62, beats: 1 }, // D4
  { midi: 64, beats: 1 }, // E4
  { midi: 69, beats: 2 }, // A4 — the held note the returns stack under
  { midi: 71, beats: 0.5 }, // B4, briefly
  { midi: 57, beats: 1.5 }, // A3 — the resolution
]

/** Total beats in the phrase — the unit the scheduler divides seconds by. */
export const FIGURE_BEATS = FIGURE.reduce((sum, note) => sum + note.beats, 0)

/** Onset of each figure note within one phrase of `phraseSeconds`, seconds. */
export const figureOnsets = (phraseSeconds: number): number[] => {
  const onsets: number[] = []
  let beat = 0
  for (const note of FIGURE) {
    onsets.push((beat * phraseSeconds) / FIGURE_BEATS)
    beat += note.beats
  }
  return onsets
}

export interface CanonMark {
  t: number
  /** Phrase starts draw taller, so the eye can track alignment. */
  isStart: boolean
}

export interface CanonRow {
  label: string
  /** Fade per generation, dry = 1. */
  alpha: number
  marks: CanonMark[]
}

export interface CanonLayout {
  span: number
  rows: CanonRow[]
  /** Vertical rules at every phrase start. */
  phraseRules: number[]
  /** Where a phrase start meets a return — the lock made visible. */
  coincidences: number[]
}

const GENERATIONS = 4
const EPSILON = 1e-6

/**
 * Everything the canvas draws, precomputed: the dry row plus returns at T, 2T,
 * 3T across a span wide enough that the last generation has content in it —
 * a window of exactly one return leaves the bottom row with a single mark and
 * reads as a bug (learned in the mockup).
 */
export const canonLayout = (phraseSeconds: number, delaySeconds: number): CanonLayout => {
  const { returnSeconds } = canonRatio(phraseSeconds, delaySeconds)
  const span = Math.min(
    Math.max(returnSeconds, delaySeconds * 3 + phraseSeconds * 2),
    delaySeconds * 8
  )
  const onsets = figureOnsets(phraseSeconds)
  const rows: CanonRow[] = []
  for (let gen = 0; gen < GENERATIONS; gen++) {
    const marks: CanonMark[] = []
    for (let phraseStart = 0; phraseStart < span; phraseStart += phraseSeconds) {
      onsets.forEach((onset, index) => {
        const t = phraseStart + onset
        if (t >= span) return
        const at = t + gen * delaySeconds
        if (at > span) return
        marks.push({ t: at, isStart: index === 0 })
      })
    }
    rows.push({ label: gen === 0 ? 'YOU' : `${gen}T`, alpha: 0.72 ** gen, marks })
  }
  const phraseRules: number[] = []
  for (let t = 0; t <= span + EPSILON; t += phraseSeconds) phraseRules.push(t)
  const coincidences: number[] = []
  for (let s = 0; s <= span; s += 0.25) {
    const onPhrase = Math.abs(s / phraseSeconds - Math.round(s / phraseSeconds)) < EPSILON
    let onReturn = false
    for (let gen = 1; gen < GENERATIONS; gen++) {
      const rel = s - gen * delaySeconds
      if (
        rel >= -EPSILON &&
        Math.abs(rel / phraseSeconds - Math.round(rel / phraseSeconds)) < EPSILON
      ) {
        onReturn = true
      }
    }
    if (onPhrase && onReturn) coincidences.push(s)
  }
  return { span, rows, phraseRules, coincidences }
}

/** The "make it drift" shortcut: the most stubbornly coprime phrase available
 * near 3/4 of T on the quarter-second grid (ported from the mockup). */
export const driftPhrase = (delaySeconds: number, min = 0.5, max = 8): number => {
  let p = quarters(Math.max(min, Math.min(max, delaySeconds * 0.75 + 0.25))) / 4
  if (quarters(p) % quarters(delaySeconds) === 0) p += 0.25
  return p
}
