// Presets are URL state, shareable (Audio engine §9). Encoding is short
// query keys; decoding goes through sanitizeParams, so a hand-edited URL is
// clamped into the safe ranges rather than trusted.

import type { RigParamName, RigParams } from './params'
import { defaultParams, sanitizeParams } from './params'
import { presetParams } from './presets'

/** Short, stable query keys. The URL is user-visible surface — keep it terse. */
const KEYS: Record<RigParamName, string> = {
  distanceSeconds: 'd',
  feedback: 'fb',
  recordHead: 'rec',
  monitor: 'mon',
  loopOut: 'out',
  tapeAge: 'age',
  master: 'm',
}

const SPEED_KEY = 'ips'
const PRESET_KEY = 'preset'

/** Where the Rig persists its state for read-only reflectors (the chapter-1
 * XS readout). Same codec as the URL, so storage is sanitized on read too. */
export const RIG_STATE_STORAGE_KEY = 'two-machines:rig'

/** Encode params as a query string, omitting anything still at its default —
 * a pristine rig shares as an empty string, and short links stay short. */
export function encodeRigState(params: RigParams): string {
  const defaults = defaultParams()
  const q = new URLSearchParams()
  for (const [name, key] of Object.entries(KEYS) as [RigParamName, string][]) {
    if (params[name] !== defaults[name]) {
      q.set(key, trim(params[name]))
    }
  }
  if (params.speed !== defaults.speed) {
    q.set(SPEED_KEY, params.speed)
  }
  return q.toString()
}

/** Decode a query string into safe params. Precedence: explicit param keys
 * override a preset, which overrides the defaults. Unknown keys are ignored;
 * out-of-range values are clamped; a bad preset id degrades to the default
 * rig. Never throws — a URL is untrusted input, not an API. */
export function decodeRigState(query: string): RigParams {
  const q = new URLSearchParams(query)
  const presetId = q.get(PRESET_KEY)
  const base = presetId !== null ? presetParams(presetId) : defaultParams()

  const partial: Record<string, unknown> = { ...base }
  for (const [name, key] of Object.entries(KEYS) as [RigParamName, string][]) {
    const raw = q.get(key)
    if (raw !== null) partial[name] = raw
  }
  const speed = q.get(SPEED_KEY)
  if (speed !== null) partial['speed'] = speed
  return sanitizeParams(partial)
}

/** Print numbers without float noise: two decimals, trailing zeros dropped. */
function trim(n: number): string {
  return String(Number(n.toFixed(2)))
}
