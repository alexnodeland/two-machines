// View layout for the Cycles engine (Cycles engine §4): one canvas, three
// render functions — and the geometry that drives them lives here, pure and
// fully tested, so the canvas layer is plumbing rather than logic.
//
// The rules each layout encodes are load-bearing:
// - The GRID is the explanatory view and is DISABLED IN DRIFT (ADR-016) —
//   there is no shared grid to draw, and that is the point, not a limitation.
// - Above ~1200 cells the grid refuses to draw and says why, rather than
//   rendering mush.
// - The RIBBON caps its span at 120 pulses; if the return is longer it says
//   so on the canvas rather than silently truncating.
// - The DIALS are the only view that survives drift. Hit feedback is an
//   expanding ring, never a filled disc.

import { coincidences, isHit, lcm, returnPulses } from '../math/cycles'
import type { CyclesMode, Voice } from './presets'

export const GRID_MAX_CELLS = 1200
export const RIBBON_MAX_SPAN = 120

// ---------------------------------------------------------------------------
// Grid — the explanatory view
// ---------------------------------------------------------------------------

export type GridCellState = 'none' | 'v1' | 'v2' | 'unison'

export interface GridCell {
  col: number
  row: number
  pulse: number
  /** Voice one hit → brass fill; voice two → aqua ring; both → unison fill. */
  state: GridCellState
  /** A third voice reads as present without competing: a small mark. */
  thirdMark: boolean
}

export interface GridLayout {
  kind: 'grid'
  /** Columns = voice one's cycle. */
  cols: number
  /** Rows = lcm(v1, v2) / v1.cycle. */
  rows: number
  cells: GridCell[]
  /** The outlined current pulse, folded into the orbit. */
  currentCol: number
  currentRow: number
}

export interface RefusedLayout {
  kind: 'refused'
  reason: string
}

export function gridLayout(
  voices: readonly Voice[],
  mode: CyclesMode,
  currentPulse: number
): GridLayout | RefusedLayout {
  if (mode === 'drift') {
    return {
      kind: 'refused',
      reason: 'No shared grid in drift — two tempos never agree on one. Watch the dials.',
    }
  }
  const [v1, v2] = voices
  if (!v1 || !v2) {
    return { kind: 'refused', reason: 'The grid needs at least two voices.' }
  }

  const cols = v1.cycle
  const span = lcm(v1.cycle, v2.cycle)
  const rows = span / cols
  if (cols * rows > GRID_MAX_CELLS) {
    return {
      kind: 'refused',
      reason: `An orbit of ${span} pulses is too long to read as a grid. Use the ribbon or the dials.`,
    }
  }

  const third = voices[2]
  const cells: GridCell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pulse = row * cols + col
      const one = isHit(v1, pulse)
      const two = isHit(v2, pulse)
      const state: GridCellState =
        one && two ? 'unison' : one ? 'v1' : two ? 'v2' : 'none'
      cells.push({
        col,
        row,
        pulse,
        state,
        thirdMark: third ? isHit(third, pulse) : false,
      })
    }
  }

  const folded = ((Math.floor(currentPulse) % span) + span) % span
  return {
    kind: 'grid',
    cols,
    rows,
    cells,
    currentCol: folded % cols,
    currentRow: Math.floor(folded / cols),
  }
}

// ---------------------------------------------------------------------------
// Ribbon — the time view
// ---------------------------------------------------------------------------

export interface RibbonLane {
  voice: number
  /** Pulses within the span on which this voice sounds. */
  hits: number[]
  /** Cycle boundaries (bar lines) within the span. */
  boundaries: number[]
}

export interface RibbonLayout {
  kind: 'ribbon'
  /** Drawn span in pulses, capped at RIBBON_MAX_SPAN. */
  span: number
  /** The full return, for the caption when truncated. */
  returnAt: number
  /** When true the canvas says so rather than silently truncating. */
  truncated: boolean
  lanes: RibbonLane[]
  /** Coincidences within the span — the vertical rules. */
  rules: number[]
  /** Playhead position, folded into the span. */
  playhead: number
}

export function ribbonLayout(
  voices: readonly Voice[],
  currentPulse: number
): RibbonLayout {
  const returnAt = voices.length ? returnPulses(voices) : 0
  const span = Math.min(Math.max(returnAt, 1), RIBBON_MAX_SPAN)
  const lanes: RibbonLane[] = voices.map((v, index) => {
    const hits: number[] = []
    for (let p = 0; p < span; p++) {
      if (isHit(v, p)) hits.push(p)
    }
    const boundaries: number[] = []
    for (let b = 0; b <= span; b += v.cycle) boundaries.push(b)
    return { voice: index, hits, boundaries }
  })
  return {
    kind: 'ribbon',
    span,
    returnAt,
    truncated: returnAt > RIBBON_MAX_SPAN,
    lanes,
    rules: coincidences(voices, span),
    // span is clamped to ≥1 above, so the fold is always well-defined
    playhead: ((currentPulse % span) + span) % span,
  }
}

// ---------------------------------------------------------------------------
// Dials — the drift view
// ---------------------------------------------------------------------------

export interface DialRing {
  voice: number
  /** 0 at birth, 1 at death — drives radius and fade. */
  age: number
}

export interface DialLayout {
  kind: 'dials'
  dials: {
    voice: number
    /** 0..1 of the voice's own cycle — one revolution per cycle. */
    phase: number
    /** Rim marks at each hit position, as 0..1 fractions of the cycle. */
    marks: number[]
  }[]
  /** Expanding rings, never filled discs — a disc large enough to read
   * swallows the rim marks it points at. */
  rings: DialRing[]
}

export interface RingEvent {
  voice: number
  /** Seconds since the hit was heard. */
  ageSeconds: number
}

export const RING_LIFETIME_SECONDS = 0.4

export function dialLayout(
  voices: readonly Voice[],
  currentPulse: number,
  ringEvents: readonly RingEvent[] = []
): DialLayout {
  return {
    kind: 'dials',
    dials: voices.map((v, index) => ({
      voice: index,
      // Each voice turns once per its own cycle, at its own rate — in drift
      // you watch two hands separate, and no arithmetic brings them back.
      phase: ((((currentPulse * (v.rate || 1)) / v.cycle) % 1) + 1) % 1,
      marks: v.hits.map((h) => h / v.cycle),
    })),
    rings: ringEvents
      .filter((e) => e.ageSeconds >= 0 && e.ageSeconds < RING_LIFETIME_SECONDS)
      .map((e) => ({ voice: e.voice, age: e.ageSeconds / RING_LIFETIME_SECONDS })),
  }
}
