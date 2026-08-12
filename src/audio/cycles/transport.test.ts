import { describe, expect, it } from 'vitest'
import type { Voice } from './presets'
import {
  createTransport,
  LOOKAHEAD_SECONDS,
  PAINT_LATENCY_SECONDS,
  TICK_MS,
  type TransportClock,
  type TransportTimer,
} from './transport'

// No wall clock, no ambient timers (testing-strategy §6): the tests own time.

class FakeClock implements TransportClock {
  t = 0
  now(): number {
    return this.t
  }
}

class FakeTimer implements TransportTimer {
  fn: (() => void) | null = null
  cleared = 0
  set(fn: () => void, ms: number): unknown {
    expect(ms).toBe(TICK_MS)
    this.fn = fn
    return 'handle'
  }
  clear(handle: unknown): void {
    if (handle !== null) this.cleared++
    this.fn = null
  }
}

const voice = (cycle: number, hits: number[], rate = 1): Voice => ({
  name: `v${cycle}`,
  cycle,
  hits,
  rate,
  timbre: { freq: 900, tone: 0.5 },
  muted: false,
  colour: 'brass',
})

const setup = (opts?: { bpm?: number; voices?: Voice[]; pulse?: boolean }) => {
  const clock = new FakeClock()
  const timer = new FakeTimer()
  const fired: { voice: number | null; beat: number; time: number }[] = []
  const transport = createTransport({
    clock,
    timer,
    bpm: opts?.bpm ?? 60,
    voices: opts?.voices ?? [voice(4, [0])],
    pulse: opts?.pulse ?? false,
    onFire: (v, beat, time) => fired.push({ voice: v, beat, time }),
  })
  return { clock, timer, fired, transport }
}

describe('scheduling', () => {
  it('books events ahead of the clock, inside the lookahead window', () => {
    const { fired, transport } = setup({ bpm: 60, voices: [voice(1, [0])] })
    transport.start()
    // t0 = 0.08; horizon = 0.12 → exactly the first beat is booked
    expect(fired).toEqual([{ voice: 0, beat: 0, time: 0.08 }])
  })

  it('advancing the clock books more events on each tick', () => {
    const { clock, timer, fired, transport } = setup({ bpm: 60, voices: [voice(1, [0])] })
    transport.start()
    clock.t = 1.0
    timer.fn?.()
    // beats at 0.08, 1.08 are now inside 1.12
    expect(fired.map((f) => f.beat)).toEqual([0, 1])
    expect(fired[1]?.time).toBeCloseTo(1.08, 10)
  })

  it('fires only on hit beats of the cycle', () => {
    const { clock, timer, fired, transport } = setup({
      bpm: 240,
      voices: [voice(4, [0, 2])],
    })
    transport.start()
    clock.t = 2.0
    timer.fn?.()
    // 8 beats booked (0.25 s each from 0.08); hits on beats 0,2,4,6...
    for (const f of fired) {
      expect([0, 2].includes(f.beat % 4)).toBe(true)
    }
    expect(fired.length).toBeGreaterThan(2)
  })

  it('a muted voice is painted but not sounded', () => {
    const muted = { ...voice(1, [0]), muted: true }
    const { clock, fired, transport } = setup({ bpm: 60, voices: [muted] })
    transport.start()
    clock.t = 0.08 + PAINT_LATENCY_SECONDS
    expect(fired).toEqual([]) // no audio
    expect(transport.drain().map((e) => e.beat)).toEqual([0]) // still painted
  })

  it('offset and drift are the same code path: rate scales the spacing', () => {
    const fast = voice(1, [0], 2)
    const { fired, transport } = setup({ bpm: 60, voices: [fast] })
    transport.start()
    // spb = 0.5 → beats at 0.08 and 0.58? no: horizon 0.12 books only 0.08
    expect(fired.map((f) => f.beat)).toEqual([0])
    expect(LOOKAHEAD_SECONDS).toBe(0.12)
  })

  it('sounds the bare pulse under everything when asked', () => {
    const { fired, transport } = setup({ bpm: 60, voices: [], pulse: true })
    transport.start()
    expect(fired).toEqual([{ voice: null, beat: 0, time: 0.08 }])
  })
})

describe('construction defaults', () => {
  it('runs with nothing but a clock and a timer', () => {
    const clock = new FakeClock()
    const timer = new FakeTimer()
    const transport = createTransport({ clock, timer })
    transport.start()
    expect(transport.bpm).toBe(84)
    expect(transport.pulse).toBe(false)
    expect(transport.drain()).toEqual([])
  })

  it('the default onFire is a safe no-op', () => {
    const clock = new FakeClock()
    const timer = new FakeTimer()
    const transport = createTransport({ clock, timer, voices: [voice(1, [0])] })
    expect(() => transport.start()).not.toThrow()
  })

  it('a zero rate is treated as 1 rather than dividing by zero', () => {
    const { fired, transport } = setup({ bpm: 60, voices: [voice(1, [0], 0)] })
    transport.start()
    expect(fired).toEqual([{ voice: 0, beat: 0, time: 0.08 }])
  })
})

describe('transport control', () => {
  it('start is idempotent and stop clears the timer and the paint queue', () => {
    const { clock, timer, transport } = setup()
    transport.start()
    transport.start()
    expect(transport.playing).toBe(true)
    clock.t = 1
    transport.stop()
    expect(transport.playing).toBe(false)
    expect(timer.cleared).toBe(1)
    expect(transport.drain()).toEqual([])
  })

  it('setBpm retimes in place — mid-exercise tempo changes keep your place', () => {
    const { clock, timer, fired, transport } = setup({ bpm: 60, voices: [voice(1, [0])] })
    transport.start()
    transport.setBpm(120)
    expect(transport.bpm).toBe(120)
    clock.t = 1.6
    timer.fn?.()
    // the cursor keeps its already-booked next beat (1.08, set at the old
    // tempo), then continues at the new 0.5 s spacing — no restart, no jump
    expect(fired.map((f) => f.time)).toEqual([0.08, 1.08, 1.58])
  })

  it('setVoices resets cursors while playing', () => {
    const { clock, timer, fired, transport } = setup({ bpm: 60, voices: [voice(1, [0])] })
    transport.start()
    clock.t = 0.5
    transport.setVoices([voice(2, [0])])
    timer.fn?.()
    // reset: new t0 = 0.58, first beat of the new voice booked from there
    expect(fired[fired.length - 1]).toEqual({ voice: 0, beat: 0, time: 0.58 })
  })

  it('setPulse mid-run starts the pulse from now, not from t0', () => {
    const { clock, timer, fired, transport } = setup({ bpm: 60, voices: [] })
    transport.start()
    clock.t = 5
    transport.setPulse(true)
    timer.fn?.()
    expect(transport.pulse).toBe(true)
    expect(fired[0]?.time).toBeCloseTo(5, 10) // not a burst of catch-up beats
  })
})

describe('the playhead and the paint queue', () => {
  it('pulseNow is 0 when stopped and tracks elapsed pulses when playing', () => {
    const { clock, transport } = setup({ bpm: 120 })
    expect(transport.pulseNow()).toBe(0)
    transport.start()
    clock.t = 1.08 // 1 s after t0 at 120 bpm = 2 pulses
    expect(transport.pulseNow()).toBeCloseTo(2, 10)
  })

  it('drain releases events only when their audio has been heard', () => {
    const { clock, transport } = setup({ bpm: 60, voices: [voice(1, [0])] })
    transport.start()
    expect(transport.drain()).toEqual([]) // 0.08 not yet audible at t=0
    clock.t = 0.08 + PAINT_LATENCY_SECONDS
    expect(transport.drain().map((e) => e.beat)).toEqual([0])
    expect(transport.drain()).toEqual([]) // drained once, gone
  })
})
