// The lesson presets, verbatim from Audio engine §9. Every lesson deep-links
// the Rig with one of these plus a prompt; presets are URL state, shareable,
// and validated on read (sanitizeParams) so a hand-edited link cannot reach
// an unsafe state.

import type { RigParams } from './params'
import { defaultParams, sanitizeParams } from './params'

export interface RigPreset {
  id: string
  /** What the preset teaches; the grammar lesson it belongs to, if any. */
  teaches: string
  params: RigParams
}

const preset = (
  id: string,
  teaches: string,
  overrides: Partial<Record<keyof RigParams, number | string>>
): RigPreset => ({
  id,
  teaches,
  params: sanitizeParams(overrides),
})

/** Audio engine §9, one row per preset. Order matters: it is the order the
 * grammar chapter steps through them. */
export const RIG_PRESETS: readonly RigPreset[] = [
  preset('default', '—', {}),
  preset('three-notes', 'grammar 1', {
    distanceSeconds: 3.5,
    feedback: 0.8,
    recordHead: 0.9,
    monitor: 0.8,
    tapeAge: 0.3,
  }),
  preset('beeping', 'grammar 2', {
    distanceSeconds: 4.0,
    feedback: 0.78,
    recordHead: 0.9,
    monitor: 0.75,
    tapeAge: 0.34,
  }),
  preset('not-committing', 'grammar 3 — the split', {
    distanceSeconds: 4.5,
    feedback: 0.82,
    recordHead: 0.0,
    monitor: 0.9,
    tapeAge: 0.35,
  }),
  preset('mud', 'grammar 4 — deliberate failure', {
    distanceSeconds: 3.0,
    feedback: 0.96,
    recordHead: 1.0,
    monitor: 0.7,
    tapeAge: 0.55,
  }),
  preset('swells', 'grammar 5', {
    distanceSeconds: 5.0,
    feedback: 0.8,
    recordHead: 0.85,
    monitor: 0.6,
    tapeAge: 0.4,
  }),
  preset('sequence-plan', 'grammar 6 — the written plan', {
    distanceSeconds: 5.0,
    feedback: 0.87,
    recordHead: 0.9,
    monitor: 0.7,
    tapeAge: 0.3,
  }),
  preset('runaway', 'past unity, safely', {
    distanceSeconds: 2.5,
    feedback: 1.06,
    recordHead: 0.8,
    monitor: 0.6,
    tapeAge: 0.5,
  }),
  preset('authentic', 'Revox-era numbers', {
    distanceSeconds: 3.2,
    feedback: 0.75,
    recordHead: 0.85,
    monitor: 0.85,
    tapeAge: 0.45,
  }),
]

export function getPreset(id: string): RigPreset | undefined {
  return RIG_PRESETS.find((p) => p.id === id)
}

/** Resolve a preset id to params, falling back to the default rig — a bad
 * deep link degrades gracefully rather than erroring. */
export function presetParams(id: string): RigParams {
  return getPreset(id)?.params ?? defaultParams()
}
