// Pure math for the Cycles engine, ported from the prototype
// (mockups/cycles.js). Two modes, and the distinction is the whole point:
//
//   OFFSET — one shared pulse, different integer cycle lengths.
//            Finite orbit. Exact return at the LCM.
//            (the clapping exercise; the Discipline interlock)
//   DRIFT  — different tempos. Continuous phase sweep. No exact return, ever.
//            (Reich's Piano Phase; a delay at an arbitrary setting)
//
// These sound alike and are not the same object. Most looping literature
// conflates them.

/** The slice of a voice the math needs. The full engine `Voice` satisfies
 * this structurally. */
export interface CycleVoice {
  cycle: number
  hits: readonly number[]
  rate?: number
}

export function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    const t = a % b
    a = b
    b = t
  }
  return a
}

export function lcm(a: number, b: number): number {
  if (!a || !b) return 0
  return Math.abs((a / gcd(a, b)) * b)
}

export function lcmAll(xs: readonly number[]): number {
  if (!xs.length) return 0
  return xs.reduce((acc, x) => lcm(acc, x))
}

/** Does this voice sound on this pulse? Negative beats wrap correctly, which
 * matters because the ribbon draws a little before zero. */
export function isHit(voice: CycleVoice, beat: number): boolean {
  const p = ((beat % voice.cycle) + voice.cycle) % voice.cycle
  return voice.hits.indexOf(p) >= 0
}

/** Pulses on which every listed voice sounds together. This is the
 * realignment, and it is the payoff in every exercise on the site. */
export function coincidences(voices: readonly CycleVoice[], span: number): number[] {
  const out: number[] = []
  if (!voices.length) return out
  for (let i = 0; i < span; i++) {
    if (voices.every((v) => isHit(v, i))) out.push(i)
  }
  return out
}

/* CONVENTION, and it matters because two pages quote this number (ADR-018).

   longestGap is the INTERVAL from one coincidence to the next — for five
   against seven that is 18, the distance from beat 11 to beat 29.

   longestInterlock is the count of beats BETWEEN them, on which nothing
   agrees — 17. That is the musically meaningful figure (it is how long you
   are on your own) and it is what the five-against-seven page already
   prints, so it is what the UI shows. Keep both: the interval is the one you
   want for arithmetic, the count is the one you say out loud. */

export function longestGap(voices: readonly CycleVoice[], span: number): number {
  const c = coincidences(voices, span)
  if (c.length === 0) return span
  if (c.length === 1) return span
  let max = 0
  for (let i = 1; i < c.length; i++) {
    max = Math.max(max, (c[i] as number) - (c[i - 1] as number))
  }
  return Math.max(max, (c[0] as number) + span - (c[c.length - 1] as number))
}

export function longestInterlock(voices: readonly CycleVoice[], span: number): number {
  return Math.max(0, longestGap(voices, span) - 1)
}

/** Fraction of pulses on which anything at all sounds. Past about 0.7 the
 * ear stops hearing an interlock and starts hearing a texture. */
export function density(voices: readonly CycleVoice[], span: number): number {
  if (!span) return 0
  let n = 0
  for (let i = 0; i < span; i++) {
    if (voices.some((v) => isHit(v, i))) n++
  }
  return n / span
}

export function hitCount(voice: CycleVoice, span: number): number {
  let n = 0
  for (let i = 0; i < span; i++) if (isHit(voice, i)) n++
  return n
}

/** The exact return, in pulses. Infinity is impossible in offset mode —
 * that is precisely what separates it from drift. */
export function returnPulses(voices: readonly CycleVoice[]): number {
  return lcmAll(voices.map((v) => v.cycle))
}

export function pulsesToSeconds(pulses: number, bpm: number): number {
  return (pulses * 60) / bpm
}

/** Drift mode. Two voices at rates rA and rB never realign unless the ratio
 * is rational; what you can state is how long until they are one full cycle
 * apart, which is the audible "wave". */
export function driftBeatSeconds(
  cycle: number,
  bpm: number,
  rateA: number,
  rateB: number
): number {
  const d = Math.abs(rateA - rateB)
  if (d < 1e-9) return Infinity
  return (cycle * 60) / (bpm * d)
}

/** Phase of a voice at time t, as 0..1 of its own cycle. */
export function phaseAt(voice: CycleVoice, t: number, bpm: number): number {
  const spb = 60 / (bpm * (voice.rate ?? 1))
  return ((t / spb) % voice.cycle) / voice.cycle
}
