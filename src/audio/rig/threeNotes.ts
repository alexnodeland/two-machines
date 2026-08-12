// The three-notes-and-silence model (grammar lesson 1,
// docs/chapters/04-the-grammar.md; mockups/s-three-notes.html is the
// behavioural ancestor). Lamont's grammar as a four-step machine: any note is
// the key; the second is pointed at the third or fifth; the third resists; the
// fourth step is silence with the record head lifted. Pure functions only —
// the component supplies the clock and the rig.

import { pitchClassName } from '../math/fretboards'

export const PITCH_CLASSES = 12
export const BLACK_KEYS: readonly number[] = [1, 3, 6, 8, 10]

export const keyName = (pc: number): string => pitchClassName(pc)

/** Intervals the lesson points at, per step. Anything is playable; these are
 * only lit. */
export const SUGGESTIONS: Record<number, readonly number[]> = {
  2: [3, 4, 7], // minor third, major third, fifth
  3: [2, 11, 12], // second, major seventh, octave
}

const INTERVAL_NAMES: Record<number, string> = {
  0: 'unison',
  1: 'flat second',
  2: 'second',
  3: 'minor third',
  4: 'major third',
  5: 'fourth',
  6: 'tritone',
  7: 'fifth',
  8: 'minor sixth',
  9: 'sixth',
  10: 'flat seventh',
  11: 'major seventh',
  12: 'octave',
}

export const intervalName = (iv: number): string => INTERVAL_NAMES[iv] ?? ''

const SHORT_NAMES: Record<number, string> = {
  2: '2nd',
  3: 'min 3',
  4: 'maj 3',
  7: '5th',
  11: 'maj 7',
  12: '8ve',
}

export const shortIntervalName = (iv: number): string => SHORT_NAMES[iv] ?? ''

/** Step 3 sits an octave up so "the octave" is reachable as a distinct
 * interval rather than a repeat of the root pad. */
export const midiFor = (pc: number, step: number): number =>
  48 + pc + (step === 3 ? 12 : 0)

export const intervalOf = (root: number | null, pc: number, step: number): number => {
  if (root === null) return 0
  const base = (((pc - root) % 12) + 12) % 12
  if (step === 3 && base === 0) return 12
  return base
}

export interface PlayedNote {
  pc: number
  iv: number
}

export interface ThreeNotesState {
  /** 1..3 are playing steps; 4 is the silence. */
  step: number
  root: number | null
  played: PlayedNote[]
}

export const initialState = (): ThreeNotesState => ({ step: 1, root: null, played: [] })

export const commitNote = (state: ThreeNotesState, pc: number): ThreeNotesState => {
  if (state.step > 3) return state
  if (state.step === 1) {
    return { step: 2, root: pc, played: [{ pc, iv: 0 }] }
  }
  const iv = intervalOf(state.root, pc, state.step)
  return {
    step: state.step + 1,
    root: state.root,
    played: [...state.played, { pc, iv }],
  }
}

export const instructionFor = (state: ThreeNotesState): string => {
  if (state.step === 1) {
    return 'Play any note. Hold it as long as you like. Whatever you choose, you are now in that key — that is the only rule in this step.'
  }
  if (state.step === 2) {
    return `You are in ${keyName(state.root as number)}. Now the second note. The third or the fifth is the idiomatic move; a minor third opening is characteristically early Frippertronics.`
  }
  if (state.step === 3) {
    return 'Third note. Resist the obvious — an octave up, a second, a major seventh, or a slide into one of them. Something that stops the loop from settling.'
  }
  return 'Now stop. Sit with three notes going round until you know what you want to add. Most people last four seconds.'
}

export const heardReadout = (played: readonly PlayedNote[]): string =>
  played.length === 0
    ? '—'
    : played
        .map((p, i) => keyName(p.pc) + (i === 0 ? '' : ` (${intervalName(p.iv)})`))
        .join('  ·  ')

const SILENCE_SAYS: readonly [number, string][] = [
  [0, 'The record head is down. Nothing you play now goes onto the tape.'],
  [4, 'Three notes, circulating. Do not add anything yet.'],
  [9, 'Notice what the decay is doing to the top end each time round.'],
  [16, 'This is where the emotional character of the whole improvisation gets decided.'],
  [
    26,
    'You have sat with it longer than most people manage. Whatever you add next will be a decision rather than a reflex.',
  ],
]

export const silenceSay = (seconds: number): string => {
  let say = SILENCE_SAYS[0]?.[1] as string
  for (const [at, text] of SILENCE_SAYS) if (seconds >= at) say = text
  return say
}
