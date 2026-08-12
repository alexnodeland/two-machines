// Lookahead scheduling for the Cycles engine (Audio engine §7, ADR-019):
// a timer runs ahead of the audio clock and books events on it, while a
// queue feeds the paint loop at the moment each event is actually heard.
// setInterval alone is far too jittery to hear five against seven honestly.
//
// Each voice schedules independently from its own rate, which makes offset
// and drift the same code path with different numbers.
//
// Testability (testing-strategy §6): no wall clock and no ambient timers —
// the transport takes a clock and a timer, and tests supply fakes.

import { isHit } from '../math/cycles'
import type { Voice } from './presets'

export const TICK_MS = 25
export const LOOKAHEAD_SECONDS = 0.12
export const PAINT_LATENCY_SECONDS = 0.012

/** The audio clock, in seconds. In production: the AudioContext. */
export interface TransportClock {
  now(): number
}

/** Ambient timers, injectable. In production: window.setInterval. */
export interface TransportTimer {
  set(fn: () => void, ms: number): unknown
  clear(handle: unknown): void
}

/** voiceIndex is null for the bare pulse under everything. */
export type OnFire = (voiceIndex: number | null, beat: number, time: number) => void

export interface PaintEvent {
  voice: number
  beat: number
  t: number
}

export interface TransportOptions {
  clock: TransportClock
  timer: TransportTimer
  bpm?: number
  voices?: Voice[]
  onFire?: OnFire
  /** Sound the bare pulse under everything. */
  pulse?: boolean
}

interface VoiceCursor {
  nextBeat: number
  nextTime: number
}

export interface Transport {
  readonly playing: boolean
  readonly bpm: number
  readonly pulse: boolean
  start(): void
  stop(): void
  setBpm(bpm: number): void
  setVoices(voices: Voice[]): void
  setPulse(on: boolean): void
  /** Elapsed pulses at the reference rate — the global playhead the ribbon
   * and grid views both draw against. */
  pulseNow(): number
  /** Paint events whose audio has actually reached the speakers. */
  drain(): PaintEvent[]
}

export function createTransport(options: TransportOptions): Transport {
  const { clock, timer } = options
  let bpm = options.bpm ?? 84
  let voices = options.voices ?? []
  let pulse = options.pulse ?? false
  const onFire: OnFire = options.onFire ?? (() => undefined)

  let playing = false
  let t0 = 0
  let handle: unknown = null
  let cursors: VoiceCursor[] = []
  let pulseCursor: VoiceCursor = { nextBeat: 0, nextTime: 0 }
  const queue: PaintEvent[] = []

  const spbFor = (v: Voice): number => 60 / (bpm * (v.rate || 1))

  const reset = (): void => {
    t0 = clock.now() + 0.08
    queue.length = 0
    cursors = voices.map(() => ({ nextBeat: 0, nextTime: t0 }))
    pulseCursor = { nextBeat: 0, nextTime: t0 }
  }

  const schedule = (): void => {
    const horizon = clock.now() + LOOKAHEAD_SECONDS

    if (pulse) {
      while (pulseCursor.nextTime < horizon) {
        onFire(null, pulseCursor.nextBeat, pulseCursor.nextTime)
        pulseCursor.nextTime += 60 / bpm
        pulseCursor.nextBeat += 1
      }
    }

    // cursors always mirrors voices (both are rebuilt together in reset);
    // the loop bound makes the pairing explicit.
    for (let vi = 0; vi < voices.length && vi < cursors.length; vi++) {
      const v = voices[vi] as Voice
      const cursor = cursors[vi] as VoiceCursor
      const spb = spbFor(v)
      while (cursor.nextTime < horizon) {
        const hit = isHit(v, cursor.nextBeat)
        if (hit && !v.muted) onFire(vi, cursor.nextBeat, cursor.nextTime)
        if (hit) queue.push({ voice: vi, beat: cursor.nextBeat, t: cursor.nextTime })
        cursor.nextTime += spb
        cursor.nextBeat += 1
      }
    }
  }

  return {
    get playing() {
      return playing
    },
    get bpm() {
      return bpm
    },
    get pulse() {
      return pulse
    },

    start(): void {
      if (playing) return
      reset()
      playing = true
      handle = timer.set(schedule, TICK_MS)
      schedule()
    },

    stop(): void {
      playing = false
      timer.clear(handle)
      handle = null
      queue.length = 0
    },

    /** Retime in place rather than restarting, so a tempo change mid
     * exercise does not throw away where you are in the cycle. */
    setBpm(b: number): void {
      bpm = b
    },

    setVoices(vs: Voice[]): void {
      voices = vs
      if (playing) reset()
    },

    setPulse(on: boolean): void {
      pulse = on
      pulseCursor = { nextBeat: 0, nextTime: clock.now() }
    },

    pulseNow(): number {
      if (!playing) return 0
      return (clock.now() - t0) / (60 / bpm)
    },

    drain(): PaintEvent[] {
      const out: PaintEvent[] = []
      while (
        queue.length &&
        (queue[0] as PaintEvent).t <= clock.now() + PAINT_LATENCY_SECONDS
      ) {
        out.push(queue.shift() as PaintEvent)
      }
      return out
    },
  }
}
