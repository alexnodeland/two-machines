// The worklet-side wiring for the Rig (Audio engine §5): create the
// QuiverAudioNode with prefix-aware URLs (ADR-037 — a raw path works in
// develop and 404s in production, invisibly, until someone presses play),
// inject the audio input, build the §2 patch, and hand back the RigNode
// surface the controller drives.
//
// The factory is injected: this module imports only *types* from
// @quiver-dsp/wasm, so the wiring is fully testable without a worklet, and
// the real createQuiverAudioNode arrives at the call site (the Rig
// component, inside a user gesture).

import { withPrefix } from 'gatsby'
import type { QuiverAudioNode, QuiverAudioNodeOptions } from '@quiver-dsp/wasm/audio'
import type { EngineParamName, RigNode } from './controller'
import { applyRigParam, buildRigPatch, type PatchEngine } from './patch'

export type QuiverNodeFactory = (
  ctx: AudioContext,
  options: QuiverAudioNodeOptions
) => Promise<QuiverAudioNode>

/** Adapt the worklet client to the PatchEngine surface the builder walks. */
export function asPatchEngine(client: QuiverAudioNode): PatchEngine {
  return {
    add_module: (typeId, name) => client.addModule(typeId, name),
    connect: (from, to) => client.connect(from, to),
    set_param_by_name: (node, param, value) => client.setParamByName(node, param, value),
    set_output: (name) => client.setOutput(name),
  }
}

export interface RigAudio {
  /** The worklet client — connect `client.node` into the Web Audio graph. */
  client: QuiverAudioNode
  /** The controller-facing surface: engine params by name, routed through
   * the patch's PARAM_ROUTES. */
  rigNode: RigNode
}

/** Build the live rig. Must be called inside a user gesture (the context is
 * created lazily for exactly that reason — audio never starts unasked). */
export async function createRigAudio(
  ctx: AudioContext,
  factory: QuiverNodeFactory
): Promise<RigAudio> {
  const client = await factory(ctx, {
    workletUrl: withPrefix('/quiver.worklet.js'),
    wasmUrl: withPrefix('/quiver_bg.wasm'),
  })

  // The input module first, so the patch's cables can reference audio_in.
  client.addAudioInput()
  buildRigPatch(asPatchEngine(client), 'audio_in')
  await client.compile()

  const engine = asPatchEngine(client)
  return {
    client,
    rigNode: {
      // The controller only emits EngineParamName keys; the cast narrows the
      // RigNode surface's string back onto the routing table.
      setParam: (name, value) => applyRigParam(engine, name as EngineParamName, value),
    },
  }
}
