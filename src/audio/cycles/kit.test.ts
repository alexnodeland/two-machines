import { describe, expect, it } from 'vitest'
import { createKit } from './kit'

// Hand-rolled Web Audio fakes (testing-strategy §2): what is asserted is that
// the right calls were made with the right values, never that audio came out.

class FakeParam {
  value = 0
  events: [string, number, number][] = []
  setValueAtTime(v: number, t: number): void {
    this.events.push(['set', v, t])
  }
  exponentialRampToValueAtTime(v: number, t: number): void {
    this.events.push(['ramp', v, t])
  }
}

class FakeNode {
  connected: FakeNode[] = []
  connect(n: FakeNode): FakeNode {
    this.connected.push(n)
    return n
  }
}

class FakeGain extends FakeNode {
  gain = new FakeParam()
}

class FakeOscillator extends FakeNode {
  type = ''
  frequency = new FakeParam()
  started: number[] = []
  stopped: number[] = []
  start(t: number): void {
    this.started.push(t)
  }
  stop(t: number): void {
    this.stopped.push(t)
  }
}

class FakeBufferSource extends FakeNode {
  buffer: unknown = null
  started: number[] = []
  stopped: number[] = []
  start(t: number): void {
    this.started.push(t)
  }
  stop(t: number): void {
    this.stopped.push(t)
  }
}

class FakeFilter extends FakeNode {
  type = ''
  frequency = { value: 0 }
  Q = { value: 0 }
}

class FakeBuffer {
  data: Float32Array
  constructor(length: number) {
    this.data = new Float32Array(length)
  }
  getChannelData(): Float32Array {
    return this.data
  }
}

class FakeContext {
  sampleRate = 1000
  destination = new FakeNode()
  gains: FakeGain[] = []
  oscillators: FakeOscillator[] = []
  sources: FakeBufferSource[] = []
  filters: FakeFilter[] = []
  buffers: FakeBuffer[] = []
  createGain(): FakeGain {
    const g = new FakeGain()
    this.gains.push(g)
    return g
  }
  createOscillator(): FakeOscillator {
    const o = new FakeOscillator()
    this.oscillators.push(o)
    return o
  }
  createBufferSource(): FakeBufferSource {
    const s = new FakeBufferSource()
    this.sources.push(s)
    return s
  }
  createBiquadFilter(): FakeFilter {
    const f = new FakeFilter()
    this.filters.push(f)
    return f
  }
  createBuffer(_ch: number, length: number): FakeBuffer {
    const b = new FakeBuffer(length)
    this.buffers.push(b)
    return b
  }
}

const ctx = (): BaseAudioContext => new FakeContext() as unknown as BaseAudioContext

describe('createKit', () => {
  it('builds a deterministic noise buffer from the injected RNG', () => {
    const c = new FakeContext()
    createKit(c as unknown as BaseAudioContext, undefined, () => 0.5)
    const buffer = c.buffers[0]
    expect(buffer?.data.length).toBe(300) // 0.3 s at 1 kHz
    expect(buffer?.data[0]).toBe(0) // 0.5 * 2 − 1
  })

  it('defaults out to the context destination, or takes a supplied node', () => {
    const c = new FakeContext()
    const kit = createKit(c as unknown as BaseAudioContext, undefined, () => 0.5)
    expect(kit.out).toBe(c.destination)
    const dest = new FakeNode()
    const kit2 = createKit(
      c as unknown as BaseAudioContext,
      dest as unknown as AudioNode,
      () => 0.5
    )
    expect(kit2.out).toBe(dest)
  })

  it('a mid-tone strike drives both the wood and the noise paths', () => {
    const c = new FakeContext()
    const kit = createKit(c as unknown as BaseAudioContext, undefined, () => 0.5)
    kit.strike(1, { freq: 800, tone: 0.5, decay: 0.2, level: 0.4 })

    // envelope: 0.0001 at t, up to level by t+3ms, back down by t+decay
    const env = c.gains[0]
    expect(env?.gain.events).toEqual([
      ['set', 0.0001, 1],
      ['ramp', 0.4, 1.003],
      ['ramp', 0.0001, 1.2],
    ])
    // wood: triangle at freq gliding down to 0.72×
    const osc = c.oscillators[0]
    expect(osc?.type).toBe('triangle')
    expect(osc?.frequency.events).toEqual([
      ['set', 800, 1],
      ['ramp', 800 * 0.72, 1.2],
    ])
    expect(osc?.started).toEqual([1])
    // noise: bandpass at 1.6× freq
    const bp = c.filters[0]
    expect(bp?.type).toBe('bandpass')
    expect(bp?.frequency.value).toBe(1280)
    expect(c.sources[0]?.started).toEqual([1])
  })

  it('tone 1 is pure noise: no oscillator', () => {
    const c = new FakeContext()
    const kit = createKit(c as unknown as BaseAudioContext, undefined, () => 0.5)
    kit.strike(0, { tone: 1 })
    expect(c.oscillators).toHaveLength(0)
    expect(c.sources).toHaveLength(1)
  })

  it('tone 0 is pure wood: no noise source', () => {
    const c = new FakeContext()
    const kit = createKit(c as unknown as BaseAudioContext, undefined, () => 0.5)
    kit.strike(0, { tone: 0 })
    expect(c.oscillators).toHaveLength(1)
    expect(c.sources).toHaveLength(0)
  })

  it('applies the documented defaults', () => {
    const c = new FakeContext()
    const kit = createKit(c as unknown as BaseAudioContext, undefined, () => 0.5)
    kit.strike(0)
    expect(c.gains[0]?.gain.events[1]).toEqual(['ramp', 0.34, 0.003])
    expect(c.oscillators[0]?.frequency.events[0]).toEqual(['set', 900, 0])
  })

  it('uses Math.random when no RNG is injected — production path', () => {
    expect(() => createKit(ctx())).not.toThrow()
  })
})
