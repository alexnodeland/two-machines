// The live-audio seam (ADR-047 §3): the master bus every engine plays
// through, and the arbiter's Web Audio adapter. The context arrives as an
// argument (always from a gesture-side caller) so this module never creates
// audio and tests can pass a hand-rolled fake.

import { attachArbiterAudio } from './arbiter'

/** How fast the bus follows volume and kill — fast enough to feel immediate,
 * slow enough never to click. */
export const BUS_RAMP_SECONDS = 0.05

interface LiveAudio {
  bus: GainNode
}

let live: LiveAudio | null = null

/** The bus between every engine and the destination. Created once per page
 * load, on first boot; attaching the arbiter adapter happens here too, so
 * volume and the kill switch work from the first sounding instrument. */
export function getMasterBus(ctx: AudioContext): AudioNode {
  if (!live) {
    const bus = ctx.createGain()
    bus.connect(ctx.destination)
    live = { bus }
    attachArbiterAudio({
      resume: () => void ctx.resume(),
      suspend: () => void ctx.suspend(),
      setBusGain: (value) => {
        const t = ctx.currentTime
        bus.gain.cancelScheduledValues(t)
        bus.gain.setValueAtTime(bus.gain.value, t)
        bus.gain.linearRampToValueAtTime(value, t + BUS_RAMP_SECONDS)
      },
    })
  }
  return live.bus
}

/** Test seam — the bus is module state, like the context it hangs from. */
export function resetLiveForTests(): void {
  live = null
}
