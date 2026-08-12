// RigController: the TypeScript side of the boundary in Audio engine §5.
// React components call set(); the controller validates, coalesces, and maps
// the physical vocabulary (machine distance, record head, tape age) onto the
// engine's parameters.
//
// setParam crosses a thread boundary by postMessage, so it is asynchronous —
// continuous gestures MUST be coalesced to one message batch per animation
// frame, not one per pointer event (§7). Sending per-event floods the
// worklet's message queue and produces exactly the zipper artefacts the
// engine's slew exists to prevent.

import { ageToCutoff, ageToHiss, ageToWow } from '../math/curves'
import type { RigParams } from './params'
import { sanitizeParams } from './params'
import { presetParams } from './presets'
import { decodeRigState, encodeRigState } from './urlState'

/** What the controller needs from the audio side. In production this is the
 * QuiverAudioNode wrapper; in tests, a hand-rolled fake (testing §2). */
export interface RigNode {
  setParam(name: string, value: number): void
}

/** requestAnimationFrame, injectable so tests drive frames by hand. */
export interface FrameScheduler {
  request(fn: () => void): unknown
  cancel(handle: unknown): void
}

/** The engine-facing parameter set: the §2 patch stages plus the three
 * effects the one tape-age knob fans out to. */
export type EngineParamName =
  | 'delaySeconds'
  | 'feedback'
  | 'recordHead'
  | 'monitor'
  | 'loopOut'
  | 'master'
  | 'rolloffHz'
  | 'wowSeconds'
  | 'hissLevel'

/** The physical controls → the engine parameters. Pure, exported for tests:
 * this is where "tape age maps to three things at once" (§3) lives. */
export function toEngineParams(p: RigParams): Record<EngineParamName, number> {
  return {
    delaySeconds: p.distanceSeconds,
    feedback: p.feedback,
    recordHead: p.recordHead,
    monitor: p.monitor,
    loopOut: p.loopOut,
    master: p.master,
    rolloffHz: ageToCutoff(p.tapeAge),
    wowSeconds: ageToWow(p.tapeAge),
    hissLevel: ageToHiss(p.tapeAge),
  }
}

export interface RigController {
  /** Current validated params — what the UI renders from. */
  readonly params: RigParams
  /** Merge a partial change. Validated immediately; sent on the next frame. */
  set(partial: Partial<RigParams>): void
  applyPreset(id: string): void
  loadFromQuery(query: string): void
  toQuery(): string
  /** Push every engine param now, regardless of dirtiness — initial sync. */
  syncAll(): void
  /** Cancel any scheduled flush. */
  dispose(): void
}

export function createRigController(
  node: RigNode,
  frames: FrameScheduler,
  initial?: Partial<RigParams>
): RigController {
  let params = sanitizeParams({ ...(initial ?? {}) })
  // The construction state counts as known: set() flushes deltas from here,
  // and pushing the full initial state to the worklet is syncAll()'s job.
  let sent: Partial<Record<EngineParamName, number>> = toEngineParams(params)
  let handle: unknown = null

  const flush = (): void => {
    handle = null
    const engine = toEngineParams(params)
    for (const [name, value] of Object.entries(engine) as [EngineParamName, number][]) {
      if (sent[name] !== value) {
        node.setParam(name, value)
        sent[name] = value
      }
    }
  }

  const scheduleFlush = (): void => {
    if (handle === null) {
      handle = frames.request(flush)
    }
  }

  const setParams = (next: RigParams): void => {
    params = next
    scheduleFlush()
  }

  return {
    get params() {
      return params
    },

    set(partial: Partial<RigParams>): void {
      setParams(sanitizeParams({ ...params, ...partial }))
    },

    applyPreset(id: string): void {
      setParams(presetParams(id))
    },

    loadFromQuery(query: string): void {
      setParams(decodeRigState(query))
    },

    toQuery(): string {
      return encodeRigState(params)
    },

    syncAll(): void {
      sent = {}
      scheduleFlush()
    },

    dispose(): void {
      if (handle !== null) {
        frames.cancel(handle)
        handle = null
      }
    },
  }
}
