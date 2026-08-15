import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  claimVoice,
  getArbiterState,
  killAllSound,
  resetArbiterForTests,
  setMasterVolume,
} from './arbiter'
import { BUS_RAMP_SECONDS, getMasterBus, resetLiveForTests } from './live'

/** A hand-rolled context: just enough surface for the bus wiring. */
const makeCtx = () => {
  const gainParam = {
    value: 1,
    cancelScheduledValues: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  }
  const bus = { gain: gainParam, connect: vi.fn() }
  return {
    currentTime: 10,
    destination: { kind: 'destination' },
    createGain: vi.fn(() => bus),
    resume: vi.fn(() => Promise.resolve()),
    suspend: vi.fn(() => Promise.resolve()),
    bus,
  }
}

afterEach(() => {
  resetLiveForTests()
  resetArbiterForTests()
})

describe('getMasterBus', () => {
  it('creates the bus once, wired to the destination', () => {
    const ctx = makeCtx()
    const bus = getMasterBus(ctx as unknown as AudioContext)
    expect(ctx.createGain).toHaveBeenCalledTimes(1)
    expect(ctx.bus.connect).toHaveBeenCalledWith(ctx.destination)
    expect(getMasterBus(ctx as unknown as AudioContext)).toBe(bus)
    expect(ctx.createGain).toHaveBeenCalledTimes(1)
  })

  it('attaches the arbiter adapter: volume ramps the bus gain', () => {
    const ctx = makeCtx()
    getMasterBus(ctx as unknown as AudioContext)
    setMasterVolume(0.5)
    expect(ctx.bus.gain.cancelScheduledValues).toHaveBeenCalledWith(10)
    expect(ctx.bus.gain.setValueAtTime).toHaveBeenCalledWith(1, 10)
    expect(ctx.bus.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0.5,
      10 + BUS_RAMP_SECONDS
    )
    expect(getArbiterState().volume).toBe(0.5)
  })

  it('attaches suspend/resume: the kill switch stops the clock', () => {
    vi.useFakeTimers()
    const ctx = makeCtx()
    getMasterBus(ctx as unknown as AudioContext)
    killAllSound()
    vi.advanceTimersByTime(200)
    expect(ctx.suspend).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('a claim resumes the context — start gestures always wake the clock', () => {
    const ctx = makeCtx()
    getMasterBus(ctx as unknown as AudioContext)
    claimVoice({ label: 'A', silence: () => {}, dispose: () => {} })
    expect(ctx.resume).toHaveBeenCalled()
  })
})
