// The Rig's public parameter contract (Audio engine §3). Controls are named
// after the physical thing, never the DSP parameter. Ranges are the safety
// contract: everything that reaches the engine passes through clampParam, so
// a hand-edited URL can never put the engine into an unsafe state.

import { clamp, type TapeSpeed } from '../math/curves'

export interface RigParams {
  /** Machine distance as delay time, seconds. 1.5–8 s; set by dragging. */
  distanceSeconds: number
  /** Tape speed — the cm↔s conversion. 7½ ips is the classic Revox setting. */
  speed: TapeSpeed
  /** Playback level (feedback gain). Unity marked at 1.0; above is runaway. */
  feedback: number
  /** Pedal one — how much of you goes onto the tape. */
  recordHead: number
  /** Pedal two — how much of you the room hears now. */
  monitor: number
  /** What the room hears of the tape, separately from the dry monitor. */
  loopOut: number
  /** One knob, three effects: rolloff + drift + hiss. */
  tapeAge: number
  /** Output, pre-limiter. */
  master: number
}

export type RigParamName = Exclude<keyof RigParams, 'speed'>

export interface ParamRange {
  min: number
  max: number
  default: number
}

/** Ranges and defaults, verbatim from Audio engine §3. */
export const PARAM_RANGES: Record<RigParamName, ParamRange> = {
  distanceSeconds: { min: 1.5, max: 8, default: 4.2 },
  feedback: { min: 0, max: 1.18, default: 0.75 },
  recordHead: { min: 0, max: 1.2, default: 0.85 },
  monitor: { min: 0, max: 1.2, default: 0.85 },
  loopOut: { min: 0, max: 1.2, default: 0.95 },
  tapeAge: { min: 0, max: 1, default: 0.35 },
  master: { min: 0, max: 1.2, default: 0.9 },
}

export const DEFAULT_SPEED: TapeSpeed = '7.5'

export const TAPE_SPEEDS: readonly TapeSpeed[] = ['3.75', '7.5', '15']

export function isTapeSpeed(value: string): value is TapeSpeed {
  return (TAPE_SPEEDS as readonly string[]).includes(value)
}

/** Clamp a numeric parameter into its range; non-finite input falls back to
 * the default rather than to an edge, so a mangled URL degrades to the
 * default rig, not to an extreme one. */
export function clampParam(name: RigParamName, value: number): number {
  const range = PARAM_RANGES[name]
  if (!Number.isFinite(value)) return range.default
  return clamp(value, range.min, range.max)
}

export function defaultParams(): RigParams {
  return {
    distanceSeconds: PARAM_RANGES.distanceSeconds.default,
    speed: DEFAULT_SPEED,
    feedback: PARAM_RANGES.feedback.default,
    recordHead: PARAM_RANGES.recordHead.default,
    monitor: PARAM_RANGES.monitor.default,
    loopOut: PARAM_RANGES.loopOut.default,
    tapeAge: PARAM_RANGES.tapeAge.default,
    master: PARAM_RANGES.master.default,
  }
}

/** Validate an arbitrary partial (URL state, preset, postMessage payload)
 * into a complete, in-range RigParams. Unknown keys are ignored; missing or
 * invalid values take defaults; numbers are clamped. */
export function sanitizeParams(partial: Partial<Record<string, unknown>>): RigParams {
  const out = defaultParams()
  for (const name of Object.keys(PARAM_RANGES) as RigParamName[]) {
    const raw = partial[name]
    if (typeof raw === 'number') {
      out[name] = clampParam(name, raw)
    } else if (typeof raw === 'string' && raw !== '') {
      out[name] = clampParam(name, Number(raw))
    }
  }
  const speed = partial['speed']
  if (typeof speed === 'string' && isTapeSpeed(speed)) {
    out.speed = speed
  }
  return out
}
