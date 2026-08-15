// The Cycles engine model and presets (Cycles engine §2, §5).
//
// RIGHTS: meters only (ADR-017, ADR-031). A King Crimson preset carries a
// cycle length and a downbeat — nothing else: generic strikes distinguished
// by register alone, no `pitches` field, ever. Any pattern beyond the
// downbeat is built by the user in the rack. The guarantee is printed on the
// page, not just recorded here, and the presets test makes it executable.
// OUR presets may carry original midi lines composed for this site, in the
// idiom — editorial material, not transcription. Only drift does: the claps
// preset is pure percussion by the client's played verdict (15 Aug 2026) —
// adding tones "kinda lost the feeling" of the counting exercise.

export type CyclesMode = 'offset' | 'drift'

export interface Voice {
  name: string
  /** Integer cycle length, 1–32. */
  cycle: number
  /** Hit indices within the cycle. */
  hits: number[]
  /** 1 in offset mode; ≠1 is what makes drift drift. */
  rate: number
  /** Generic strike: register and wood↔noise mix. Not a line. */
  timbre: { freq: number; tone: number }
  /** Midi line for OUR presets only — each fire plays the next pitch, wrapping.
   * Composed for this site, in the idiom (editorial). A King Crimson preset
   * NEVER carries this field: meters only (ADR-017, ADR-031), and the presets
   * test makes that rule executable. */
  pitches?: number[]
  muted: boolean
  /** Design-token name, resolved by the UI: brass and aqua carry the site's
   * record/play semantics; voice-three is the one sanctioned extra accent. */
  colour: string
}

export interface CyclesPreset {
  id: string
  name: string
  mode: CyclesMode
  bpm: number
  /** What one pulse is, for the readout: beats, eighths, sixteenths. */
  unit: 'beats' | 'eighths' | 'sixteenths'
  note: string
  source: string
  /** The view this preset opens in. Absent → grid (drift always forces dials).
   * Q-07 resolved 12 Aug 2026: the dials ring survives, so chapter 10's
   * circulation may default to it. */
  view?: 'grid' | 'ribbon' | 'dials'
  voices: Voice[]
}

/** Brass and aqua carry the record/play semantics; the third accent exists
 * only for a third Cycles voice and must not spread (Design system §2). */
const colourFor = (index: number): string =>
  index === 0 ? 'brass' : index === 1 ? 'aqua' : 'voice-three'

interface VoiceSpec {
  name: string
  cycle: number
  hits: number[]
  freq: number
  tone: number
  rate?: number
  /** See Voice.pitches — ours only, never on a King Crimson preset. */
  pitches?: number[]
}

const voice = (spec: VoiceSpec, index: number): Voice => ({
  name: spec.name,
  cycle: spec.cycle,
  hits: [...spec.hits],
  rate: spec.rate ?? 1,
  timbre: { freq: spec.freq, tone: spec.tone },
  ...(spec.pitches ? { pitches: [...spec.pitches] } : {}),
  muted: false,
  colour: colourFor(index),
})

const preset = (
  p: Omit<CyclesPreset, 'voices'> & { voices: VoiceSpec[] }
): CyclesPreset => ({
  ...p,
  voices: p.voices.map(voice),
})

/** Cycles engine §5, verbatim. Tempos follow the played review (15 Aug
 * 2026): fast enough that the body can feel the meter, still slow enough to
 * hear the interlock as an interlock — the page prices the difference from
 * the record honestly rather than implying the preset is the tempo. */
export const CYCLES_PRESETS: readonly CyclesPreset[] = [
  preset({
    id: 'claps',
    name: 'Five against seven',
    mode: 'offset',
    bpm: 126,
    unit: 'beats',
    note: 'The Dublin counting exercise. Count five, clap on 1 and 4; count seven, clap on 1, 4 and 6.',
    source: 'Alexander Technique Congress keynote, Dublin, 4 August 2025',
    voices: [
      // Pure claps, two registers apart — no pitch lines. Phase B tried
      // melodic lines here and the client's played verdict removed them:
      // the counting exercise is rhythm, and tones lost the feeling.
      { name: 'Five', cycle: 5, hits: [0, 3], freq: 1950, tone: 0.85 },
      { name: 'Seven', cycle: 7, hits: [0, 3, 5], freq: 780, tone: 0.85 },
    ],
  }),
  preset({
    id: 'discipline',
    name: 'Discipline · 15 : 14 : 17',
    mode: 'offset',
    bpm: 440,
    unit: 'sixteenths',
    note: 'Two guitars a sixteenth apart in cycle length, over a drum cycle of seventeen. The generative device is one player taking the other’s phrase and cutting the last note.',
    source: 'King Crimson, "Discipline", 1981 — meters only',
    voices: [
      { name: 'Guitar one · 15/16', cycle: 15, hits: [0], freq: 1400, tone: 0.3 },
      { name: 'Guitar two · 14/16', cycle: 14, hits: [0], freq: 1050, tone: 0.3 },
      { name: 'Drums · 17/16', cycle: 17, hits: [0], freq: 620, tone: 0.55 },
    ],
  }),
  preset({
    id: 'frame',
    name: 'Frame by Frame · 7 : 6',
    mode: 'offset',
    bpm: 330,
    unit: 'eighths',
    note: 'A seven against a six. The shortest orbit of the set — they are back together every forty-two.',
    source: 'King Crimson, "Frame by Frame", 1981 — meters only',
    voices: [
      { name: 'Seven', cycle: 7, hits: [0], freq: 1400, tone: 0.3 },
      { name: 'Six', cycle: 6, hits: [0], freq: 1050, tone: 0.3 },
    ],
  }),
  preset({
    id: 'thela',
    name: 'Thela Hun Ginjeet · 7 : 8',
    mode: 'offset',
    bpm: 300,
    unit: 'eighths',
    note: 'A guitar in seven against a band in common time. Off by exactly one, which is the cleanest possible case.',
    source: 'King Crimson, "Thela Hun Ginjeet", 1981 — meters only',
    voices: [
      { name: 'Guitar · 7/8', cycle: 7, hits: [0], freq: 1400, tone: 0.3 },
      { name: 'Band · 4/4', cycle: 8, hits: [0], freq: 700, tone: 0.5 },
    ],
  }),
  preset({
    id: 'indiscipline',
    name: 'Indiscipline · 15 : 8',
    mode: 'offset',
    bpm: 280,
    unit: 'eighths',
    note: 'A fifteen-eight guitar line over a four-four drum pattern.',
    source: 'King Crimson, "Indiscipline", 1981 — meters only',
    voices: [
      { name: 'Guitar · 15/8', cycle: 15, hits: [0], freq: 1400, tone: 0.3 },
      { name: 'Drums · 4/4', cycle: 8, hits: [0], freq: 700, tone: 0.5 },
    ],
  }),
  preset({
    id: 'drift',
    name: 'Drift · the same cycle, two tempos',
    mode: 'drift',
    bpm: 132,
    unit: 'beats',
    note: 'Identical patterns, one running four per cent fast. Nothing is off by an integer here, so there is no return — only a slow sweep through every phase relationship.',
    source: 'The Reich case, and what a delay does at an arbitrary setting',
    voices: [
      // One line, two tempos (ours, in the idiom): the same four ladder
      // notes braid as the copies drift — the Reich case, sung.
      {
        name: 'At tempo',
        cycle: 8,
        hits: [0, 3, 6],
        freq: 1400,
        tone: 0.4,
        rate: 1,
        pitches: [62, 64, 69, 71], // D4 E4 A4 B4
      },
      {
        name: 'Four per cent fast',
        cycle: 8,
        hits: [0, 3, 6],
        freq: 900,
        tone: 0.4,
        rate: 1.04,
        pitches: [62, 64, 69, 71], // the same line — the drift is the difference
      },
    ],
  }),
  preset({
    id: 'circulation',
    name: 'Circulation · one line, passed around',
    mode: 'offset',
    bpm: 96,
    unit: 'beats',
    note: 'Three seats around a circle, one note each, shared pulse — generic pitch, not a piece. Widen a cycle and an empty chair travels the circle; mute a seat and hand its beat to a neighbour with the hit toggles: the line survives the redistribution because it belongs to the circle, not to any player.',
    source:
      'Guitar Craft circulation practice, reconstructed as pulse and register only — the published record documents the practice sparsely, and this preset does not pretend otherwise',
    view: 'dials',
    voices: [
      // Seat registers sit on ladder classes — G5, B5, E6 — still one note
      // each, still a register step apart, still not a piece.
      { name: 'Seat one', cycle: 3, hits: [0], freq: 784, tone: 0.3 },
      { name: 'Seat two', cycle: 3, hits: [1], freq: 988, tone: 0.3 },
      { name: 'Seat three', cycle: 3, hits: [2], freq: 1319, tone: 0.3 },
    ],
  }),
]

export function getCyclesPreset(id: string): CyclesPreset | undefined {
  return CYCLES_PRESETS.find((p) => p.id === id)
}

/** Deep-copy a preset's voices for the editable rack — editing must never
 * mutate the preset itself (editing clears the preset label, §8). */
export function cloneVoices(preset: CyclesPreset): Voice[] {
  return preset.voices.map((v) => ({
    ...v,
    hits: [...v.hits],
    timbre: { ...v.timbre },
    ...(v.pitches ? { pitches: [...v.pitches] } : {}),
  }))
}
