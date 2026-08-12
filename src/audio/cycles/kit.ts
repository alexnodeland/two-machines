// Percussion for the Cycles engine, ported from the prototype
// (mockups/cycles.js createKit). Deliberately generic (Cycles engine §6):
// unpitched-ish strikes distinguished by register alone — enough to tell
// voices apart, not enough to constitute a line. Simple enough that it does
// not need quiver (§7), and deliberately not routed through the tape engine —
// this engine is about time, not decay.
//
// Determinism (testing-strategy §6): the noise buffer takes an injected RNG.

export interface StrikeOptions {
  freq?: number
  decay?: number
  level?: number
  /** 0 = wood (pitched triangle), 1 = noise; mixed between. */
  tone?: number
}

export interface Kit {
  strike(t: number, opts?: StrikeOptions): void
  out: AudioNode
}

export function createKit(
  ctx: BaseAudioContext,
  dest?: AudioNode,
  rng: () => number = Math.random
): Kit {
  const out = dest ?? ctx.destination

  const len = Math.floor(ctx.sampleRate * 0.3)
  const noise = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = noise.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = rng() * 2 - 1

  function strike(t: number, opts: StrikeOptions = {}): void {
    const freq = opts.freq ?? 900
    const decay = opts.decay ?? 0.11
    const level = opts.level ?? 0.34
    const tone = opts.tone ?? 0.5

    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(level, t + 0.003)
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay)
    g.connect(out)

    if (tone < 1) {
      const osc = ctx.createOscillator()
      const og = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, t)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, t + decay)
      og.gain.value = 1 - tone
      osc.connect(og).connect(g)
      osc.start(t)
      osc.stop(t + decay + 0.05)
    }
    if (tone > 0) {
      const src = ctx.createBufferSource()
      const bp = ctx.createBiquadFilter()
      const ng = ctx.createGain()
      src.buffer = noise
      bp.type = 'bandpass'
      bp.frequency.value = freq * 1.6
      bp.Q.value = 1.1
      ng.gain.value = tone * 0.8
      src.connect(bp).connect(ng).connect(g)
      src.start(t)
      src.stop(t + 0.3)
    }
  }

  return { strike, out }
}
