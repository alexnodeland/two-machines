// Fretboard arithmetic for chapter 9 (docs/chapters/09-harmony.md §Interactive).
// Everything here is checkable interval math: given a tuning and an interval
// shape, where do the fingers land, and does the grip survive being dragged
// across string sets? The display vocabulary downstream is pitch classes and
// interval names — never fret numbers (ADR-031: no tab, no repertoire figures).

export interface Tuning {
  name: string
  /** Open-string pitches, MIDI, low to high. */
  midi: number[]
}

export const TUNINGS: Record<'standard' | 'nst', Tuning> = {
  standard: { name: 'Standard tuning', midi: [40, 45, 50, 55, 59, 64] },
  // C2 G2 D3 A3 E4 G4 — four fifths, then the minor-third compromise on top.
  nst: { name: 'New standard tuning', midi: [36, 43, 50, 57, 64, 67] },
}

export interface Shape {
  name: string
  /** Semitones above the shape's root, one entry per consecutive string. */
  intervals: number[]
}

export const SHAPES: Record<'fifths-dyad' | 'quartal-stack' | 'close-triad', Shape> = {
  'fifths-dyad': { name: 'A bare fifth', intervals: [0, 7] },
  'quartal-stack': { name: 'A quartal stack', intervals: [0, 5, 10] },
  'close-triad': { name: 'A close major triad', intervals: [0, 4, 7] },
}

export type ShapeKey = keyof typeof SHAPES
export type TuningKey = keyof typeof TUNINGS

const PITCH_CLASSES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']

export const pitchClassName = (midi: number): string =>
  PITCH_CLASSES[((midi % 12) + 12) % 12] as string

const INTERVALS = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7']

export const intervalName = (semitones: number): string => {
  const n = Math.abs(semitones)
  if (n === 12) return 'P8'
  return INTERVALS[n % 12] as string
}

/** How many consecutive-string positions a shape has in a six-string tuning. */
export const stringSetCount = (tuning: Tuning, shape: Shape): number =>
  tuning.midi.length - shape.intervals.length + 1

export interface Placement {
  /** Index of the lowest string used, 0 = lowest-pitched. */
  startString: number
  /** Fret per used string, lowest string first; the minimum is always 0. */
  frets: number[]
  /** Sounding pitches, MIDI, one per used string. */
  midi: number[]
  /** Fret span — the stretch the hand must cover. */
  span: number
}

/**
 * Land the shape on consecutive strings starting at `startString`, keeping the
 * voicing's interval structure exact and sliding the whole grip down until its
 * lowest finger reaches the open position.
 */
export const placeShape = (
  tuning: Tuning,
  shape: Shape,
  startString: number
): Placement => {
  const sets = stringSetCount(tuning, shape)
  const s = Math.min(Math.max(startString, 0), sets - 1)
  const open = tuning.midi
  const base = open[s] as number
  const raw = shape.intervals.map((iv, i) => iv - ((open[s + i] as number) - base))
  const shift = -Math.min(...raw)
  const frets = raw.map((f) => f + shift)
  const midi = frets.map((f, i) => (open[s + i] as number) + f)
  return { startString: s, frets, midi, span: Math.max(...frets) }
}

/** "C–G" — the open strings a placement sits on, for naming the string set. */
export const stringSetLabel = (tuning: Tuning, placement: Placement): string =>
  placement.frets
    .map((_, i) => pitchClassName(tuning.midi[placement.startString + i] as number))
    .join('–')

/** True when this placement's grip differs from the shape's grip on set 0. */
export const gripChanged = (tuning: Tuning, shape: Shape, startString: number): boolean =>
  placeShape(tuning, shape, startString).frets.join(',') !==
  placeShape(tuning, shape, 0).frets.join(',')

/** Adjacent sounding intervals, named: a bare fifth is ['P5']. */
export const soundingIntervals = (shape: Shape): string[] =>
  shape.intervals
    .slice(1)
    .map((iv, i) => intervalName(iv - (shape.intervals[i] as number)))
