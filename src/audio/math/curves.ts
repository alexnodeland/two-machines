// Pure curves for the tape rig, ported from the prototype (mockups/engine.js,
// the behavioural oracle — ADR-041). Only pure functions of numbers live here;
// nothing in this directory may import anything outside it (ADR-027,
// ESLint-enforced).

/** Tape speeds in cm/s. 7½ ips is the classic Revox setting and the one the
 * delay-time-as-distance readout assumes. */
export const SPEEDS = {
  '3.75': 9.525,
  '7.5': 19.05,
  '15': 38.1,
} as const

export type TapeSpeed = keyof typeof SPEEDS

/** The whole conceit of the hero: delay time is not a parameter, it is a
 * distance you can walk across. */
export function distanceToSeconds(cm: number, speed: TapeSpeed): number {
  return cm / SPEEDS[speed]
}

export function secondsToDistance(s: number, speed: TapeSpeed): number {
  return s * SPEEDS[speed]
}

/** How many audible repeats before the signal falls under −60 dB.
 * Infinity at or past unity — that IS the runaway condition. */
export function repeatsToInaudible(feedback: number): number {
  if (feedback <= 0) return 0
  if (feedback >= 1) return Infinity
  return Math.log(0.001) / Math.log(feedback)
}

/** Seconds until the loop is inaudible, at a given machine spacing. */
export function decayTime(feedback: number, delaySeconds: number): number {
  const n = repeatsToInaudible(feedback)
  return n === Infinity ? Infinity : n * delaySeconds
}

/** Tape age 0..1 → lowpass cutoff. Each pass through an aged machine eats the
 * top; this is why a long decay browns out rather than just fading. */
export function ageToCutoff(age: number): number {
  return 16000 * Math.pow(0.055, clamp(age, 0, 1)) // 16 kHz fresh → ~880 Hz worn
}

export function ageToWow(age: number): number {
  return clamp(age, 0, 1) * 0.0022 // seconds of pitch wobble
}

export function ageToHiss(age: number): number {
  return clamp(age, 0, 1) * 0.0075
}

export function dbToGain(db: number): number {
  return Math.pow(10, db / 20)
}

export function gainToDb(g: number): number {
  return g <= 0 ? -Infinity : 20 * Math.log10(g)
}

/** Equal-tempered pitch from A440. */
export function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12)
}

/** Peak level 0..1 → how many segments of a 12-segment VU are lit, with the
 * ballistics weighted so the top of the scale is tight. */
export function vuSegments(level: number, count = 12): number {
  const db = gainToDb(clamp(level, 0, 2))
  if (db < -48) return 0
  return Math.min(count, Math.round(((db + 48) / 54) * count))
}

export type FeedbackState =
  'sparse' | 'decaying' | 'accumulating' | 'near unity' | 'runaway'

/** Feedback → a plain-language verdict. Drives the one bit of coaching the
 * rig gives you. */
export function feedbackState(feedback: number): FeedbackState {
  if (feedback < 0.35) return 'sparse'
  if (feedback < 0.72) return 'decaying'
  if (feedback < 0.93) return 'accumulating'
  if (feedback < 1.0) return 'near unity'
  return 'runaway'
}

/** RMS level (0..1) of an AnalyserNode byte time-domain buffer, where 128 is
 * silence. Pure, so the "what returns" meters can be tested as arithmetic. */
export function byteRmsLevel(bytes: ArrayLike<number>): number {
  if (bytes.length === 0) return 0
  let sum = 0
  for (let i = 0; i < bytes.length; i++) {
    const v = ((bytes[i] as number) - 128) / 128
    sum += v * v
  }
  return Math.sqrt(sum / bytes.length)
}

export function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v
}
