// The tape rig as a quiver patch (Audio engine §2): the Discreet Music
// schematic, expressed as module + cable declarations against the wasm
// engine's surface. The feedback loop is EXTERNAL — DelayLine's internal
// feedback stays at 0 and machine two's playback level is the `feedback`
// Vca in the loop. That routing is the entire idea.
//
// Corrections discovered at integration time (recorded in audio-engine.md):
// the rolloff stage is `svf` in lowpass (HighFrequencyRolloff is not a
// registry module, and the oracle itself uses a plain lowpass), and the
// audio-rate input path is upstream work (quiver#45) — the builder takes the
// input node's name so the topology is settled now.
//
// Wow/flutter is deliberately not wired here: Q-10 prefers quiver's own
// drift model if it sounds right against the oracle, so the choice is made
// at tier-3 time, not in the topology.

import type { EngineParamName } from './controller'

/** What the builder needs from the wasm engine (QuiverEngine's surface). */
export interface PatchEngine {
  add_module(typeId: string, name: string): void
  connect(from: string, to: string): void
  set_param_by_name(node: string, param: string, value: number): void
  set_output(name: string): void
}

/** Node names are the public contract between builder and controller. */
export const RIG_MODULES: readonly { name: string; type: string }[] = [
  { name: 'recordHead', type: 'vca' }, // pedal one: what goes onto the tape
  { name: 'monitor', type: 'vca' }, // pedal two: what the room hears of you, now
  { name: 'tape', type: 'tape_delay' }, // the span of tape (12 s, linear seconds)
  { name: 'rolloff', type: 'svf' }, // worn heads: each pass loses top end
  { name: 'saturator', type: 'saturator' }, // tape compression: unity becomes mud
  { name: 'feedback', type: 'vca' }, // machine two's output back into machine one
  { name: 'hiss', type: 'noise' }, // tape hiss, injected INTO the loop
  { name: 'hissLevel', type: 'vca' },
  { name: 'loopOut', type: 'vca' }, // what the room hears of the tape
  { name: 'master', type: 'vca' },
  { name: 'limiter', type: 'limiter' }, // safety, never colour
]

/** The §2 cables, with the external feedback loop closed through the
 * rolloff and the saturator. `IN` is the audio input node (quiver#45). */
export const rigCables = (inputNode: string): [string, string][] => [
  [`${inputNode}.out`, 'recordHead.in'],
  [`${inputNode}.out`, 'monitor.in'],
  ['recordHead.out', 'tape.in'],
  ['tape.out', 'rolloff.in'],
  ['rolloff.lp', 'saturator.in'],
  ['saturator.out', 'feedback.in'],
  ['feedback.out', 'tape.in'], // the loop — the entire idea
  ['hiss.out', 'hissLevel.in'],
  ['hissLevel.out', 'tape.in'], // hiss accumulates with the music
  ['saturator.out', 'loopOut.in'],
  ['monitor.out', 'master.in'],
  ['loopOut.out', 'master.in'],
  ['master.out', 'limiter.in'],
]

/** svf cutoff is Hz = 20 · 1000^cv, so cv = ln(hz/20) / ln(1000), clamped
 * to the port's 0..1. Verified against quiver's filter source. */
export function hzToSvfCutoffCv(hz: number): number {
  const cv = Math.log(hz / 20) / Math.log(1000)
  return cv < 0 ? 0 : cv > 1 ? 1 : cv
}

/** Where each controller param lands in the patch. `null` = deliberately
 * unrouted for now (wow/flutter is Q-10, decided against the oracle). */
export const PARAM_ROUTES: Record<
  EngineParamName,
  { node: string; param: string; map?: (value: number) => number } | null
> = {
  delaySeconds: { node: 'tape', param: 'time' }, // linear seconds (ADR-040)
  feedback: { node: 'feedback', param: 'gain' },
  recordHead: { node: 'recordHead', param: 'gain' },
  monitor: { node: 'monitor', param: 'gain' },
  loopOut: { node: 'loopOut', param: 'gain' },
  master: { node: 'master', param: 'gain' },
  rolloffHz: { node: 'rolloff', param: 'cutoff', map: hzToSvfCutoffCv },
  hissLevel: { node: 'hissLevel', param: 'gain' },
  wowSeconds: null, // Q-10: quiver's own drift model vs explicit LFOs
}

/** Build the rig into an engine. Idempotent per engine only if the engine
 * is fresh; callers construct once per worklet. */
export function buildRigPatch(engine: PatchEngine, inputNode = 'audio_in'): void {
  for (const m of RIG_MODULES) {
    engine.add_module(m.type, m.name)
  }
  for (const [from, to] of rigCables(inputNode)) {
    engine.connect(from, to)
  }

  // The tape's internal recirculation is unused: the external loop carries
  // the feedback (and the saturation lives visibly in that loop). Fully wet:
  // the dry path is the monitor Vca, not the delay's mix.
  engine.set_param_by_name('tape', 'feedback', 0)
  engine.set_param_by_name('tape', 'mix', 1)

  engine.set_output('limiter')
}

/** Apply one controller param to the patch. Unrouted params are a no-op. */
export function applyRigParam(
  engine: PatchEngine,
  name: EngineParamName,
  value: number
): void {
  const route = PARAM_ROUTES[name]
  if (route === null) return
  engine.set_param_by_name(route.node, route.param, route.map ? route.map(value) : value)
}
