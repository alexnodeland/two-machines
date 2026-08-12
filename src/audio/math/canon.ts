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

/** The four-note figure. Deliberately plain — the lesson is about when it
 * comes back, not what it is — and not a quotable part (ADR-031). */
export const FIGURE: readonly number[] = [0, 7, 3, 10]
export const FIGURE_ROOT = 50 // D

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
  const stepDur = phraseSeconds / FIGURE.length
  const rows: CanonRow[] = []
  for (let gen = 0; gen < GENERATIONS; gen++) {
    const marks: CanonMark[] = []
    for (let t = 0; t < span; t += stepDur) {
      const at = t + gen * delaySeconds
      if (at > span) continue
      marks.push({ t: at, isStart: Math.round(t / stepDur) % FIGURE.length === 0 })
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
