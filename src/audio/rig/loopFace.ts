// The loop face model (grammar lesson 2, docs/chapters/04-the-grammar.md;
// reused by chapter 3.3): one revolution of the ring is one pass of the tape.
// Notes land where you played them and fade a little each time round, which is
// the only honest way to draw a decaying loop (mockups/m-beeping-droning.html
// is the behavioural ancestor). Everything here is pure functions of numbers;
// the canvas painter walks the arcs this module computes.

import { LADDER } from '../math/ladder'

export interface LoopMark {
  /** Seconds on the shared clock when the note started. */
  start: number
  /** Seconds when it ended, or null while still held. */
  end: number | null
  midi: number
}

/** Home-row keys for the eight pads, left hand low. */
const PAD_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'] as const

/** The pad set: the fifths ladder (src/audio/math/ladder.ts) — NST's stacked
 * fifths, C3 to A5, wide enough that droning low and beeping up top stay
 * legible against each other. An original pad set, not a piece (ADR-031). */
export const PAD_NOTES: readonly { n: string; midi: number; key: string }[] = LADDER.map(
  (note, index) => ({
    n: note.name,
    midi: note.midi,
    key: PAD_KEYS[index] as string,
  })
)

const LO = 48
const HI = 81

export interface LoopArc {
  /** Fraction of the revolution where the arc begins, 0 at the top. */
  startFrac: number
  /** Arc length as a fraction of the revolution; a beep is near zero. */
  lengthFrac: number
  /** Radial position 0..1, low notes inside. */
  radiusFrac: number
  /** Amplitude after decay: fb^revolutions. Live notes stay at 1. */
  amp: number
  live: boolean
}

export interface LoopFaceState {
  arcs: LoopArc[]
  /** How full the loop is: arc lengths weighted by amplitude. */
  occupancy: number
}

/** Below this, a level reads as nothing: dead marks are pruned here and the
 * meters call the loop empty. Shared with the register spread. */
export const OCCUPANCY_FLOOR = 0.02

/** The one decay law: a live note stays at 1; a released note falls by the
 * feedback ratio every revolution. The fullness meter, the loop face and the
 * register spread (registerSpread.ts) all read this same amplitude. */
export const markAmp = (
  m: LoopMark,
  now: number,
  period: number,
  feedback: number
): number => (m.end === null ? 1 : feedback ** Math.max(0, (now - m.start) / period))

/** How much of one revolution a mark covers — a hold longer than one pass
 * just fills the ring. */
export const markLengthFrac = (m: LoopMark, now: number, period: number): number =>
  Math.min((m.end ?? now) - m.start, period) / period

/** A mark is dead once its loudest echo has decayed below the floor. */
export const pruneMarks = (
  marks: readonly LoopMark[],
  now: number,
  period: number,
  feedback: number
): LoopMark[] => marks.filter((m) => markAmp(m, now, period, feedback) >= OCCUPANCY_FLOOR)

export const loopFaceState = (
  marks: readonly LoopMark[],
  now: number,
  period: number,
  feedback: number
): LoopFaceState => {
  const arcs: LoopArc[] = []
  let occupancy = 0
  for (const m of marks) {
    const arc: LoopArc = {
      startFrac: (m.start % period) / period,
      lengthFrac: markLengthFrac(m, now, period),
      radiusFrac: (m.midi - LO) / (HI - LO),
      amp: markAmp(m, now, period, feedback),
      live: m.end === null,
    }
    arcs.push(arc)
    occupancy += arc.lengthFrac * arc.amp
  }
  return { arcs, occupancy: Math.min(1.4, occupancy) }
}

export type MudState = 'empty' | 'sparse' | 'speaking' | 'dense' | 'mud'

export interface MudReading {
  state: MudState
  /** True at 'dense' and above — the meter goes runaway-red. */
  mud: boolean
  say: string
}

const SAYS: readonly [number, string][] = [
  [
    0,
    'Play a few notes. The ring shows you exactly how much of the loop is already spoken for.',
  ],
  [0.12, 'Sparse. There is room for a listener to get a grip on this.'],
  [0.34, 'Speaking. This is the range most of Let the Power Fall lives in.'],
  [0.62, 'Dense. Every new note now has to fight the ones already there.'],
  [
    0.85,
    'Mud. Everything is present all the time, so nothing is. Stop playing and let it thin out — that is the fix, not more notes.',
  ],
]

export const mudReading = (occupancy: number): MudReading => {
  const state: MudState =
    occupancy < OCCUPANCY_FLOOR
      ? 'empty'
      : occupancy < 0.34
        ? 'sparse'
        : occupancy < 0.62
          ? 'speaking'
          : occupancy < 0.85
            ? 'dense'
            : 'mud'
  let say = SAYS[0]?.[1] as string
  for (const [at, text] of SAYS) if (occupancy >= at) say = text
  return { state, mud: occupancy >= 0.62, say }
}
