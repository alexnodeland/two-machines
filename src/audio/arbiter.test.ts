import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  SUSPEND_AFTER_MS,
  attachArbiterAudio,
  claimVoice,
  getArbiterState,
  killAllSound,
  releaseVoice,
  resetArbiterForTests,
  retireVoice,
  setMasterVolume,
  subscribeArbiter,
  type ArbiterAudio,
  type Voice,
} from './arbiter'

const makeVoice = (label: string): Voice & { log: string[] } => {
  const log: string[] = []
  return {
    label,
    log,
    silence: () => log.push('silence'),
    dispose: () => log.push('dispose'),
  }
}

const makeAdapter = (): ArbiterAudio & { log: string[] } => {
  const log: string[] = []
  return {
    log,
    resume: () => log.push('resume'),
    suspend: () => log.push('suspend'),
    setBusGain: (v: number) => log.push(`gain:${v}`),
  }
}

afterEach(resetArbiterForTests)

describe('claimVoice', () => {
  it('makes the claimer the sounding voice and resumes the context', () => {
    const adapter = makeAdapter()
    attachArbiterAudio(adapter)
    const a = makeVoice('The Rig')
    claimVoice(a)
    expect(getArbiterState().sounding).toBe('The Rig')
    expect(adapter.log).toContain('resume')
    expect(a.log).toEqual([])
  })

  it('silences the previous holder — switching is not overlap', () => {
    const a = makeVoice('A')
    const b = makeVoice('B')
    claimVoice(a)
    claimVoice(b)
    expect(a.log).toEqual(['silence'])
    expect(b.log).toEqual([])
    expect(getArbiterState().sounding).toBe('B')
  })

  it('re-claiming by the holder does not self-silence', () => {
    const a = makeVoice('A')
    claimVoice(a)
    claimVoice(a)
    expect(a.log).toEqual([])
  })

  it('works with no adapter attached — audio may never have booted', () => {
    const a = makeVoice('A')
    expect(() => claimVoice(a)).not.toThrow()
  })
})

describe('releaseVoice', () => {
  it('clears the holder without teardown', () => {
    const a = makeVoice('A')
    claimVoice(a)
    releaseVoice(a)
    expect(getArbiterState().sounding).toBeNull()
    expect(a.log).toEqual([])
  })

  it('ignores a release from a non-holder', () => {
    const a = makeVoice('A')
    const b = makeVoice('B')
    claimVoice(a)
    releaseVoice(b)
    expect(getArbiterState().sounding).toBe('A')
  })
})

describe('retireVoice', () => {
  it('silences and disposes the holder and clears it', () => {
    const a = makeVoice('A')
    claimVoice(a)
    retireVoice(a)
    expect(a.log).toEqual(['silence', 'dispose'])
    expect(getArbiterState().sounding).toBeNull()
  })

  it('tears down a non-holder too — no engine outlives its component', () => {
    const a = makeVoice('A')
    const b = makeVoice('B')
    claimVoice(a)
    claimVoice(b)
    retireVoice(a)
    expect(a.log).toEqual(['silence', 'silence', 'dispose'])
    expect(getArbiterState().sounding).toBe('B')
  })
})

describe('killAllSound', () => {
  it('silences and disposes now; suspends after the fade window', () => {
    vi.useFakeTimers()
    const adapter = makeAdapter()
    attachArbiterAudio(adapter)
    const a = makeVoice('A')
    claimVoice(a)
    killAllSound()
    expect(a.log).toEqual(['silence', 'dispose'])
    expect(getArbiterState().sounding).toBeNull()
    expect(adapter.log).not.toContain('suspend')
    vi.advanceTimersByTime(SUSPEND_AFTER_MS)
    expect(adapter.log).toContain('suspend')
    vi.useRealTimers()
  })

  it('suspends even with nothing sounding — the switch always lands silent', () => {
    vi.useFakeTimers()
    const adapter = makeAdapter()
    attachArbiterAudio(adapter)
    killAllSound()
    vi.advanceTimersByTime(SUSPEND_AFTER_MS)
    expect(adapter.log).toContain('suspend')
    vi.useRealTimers()
  })

  it('a claim cancels a pending suspend — kill then play never freezes', () => {
    vi.useFakeTimers()
    const adapter = makeAdapter()
    attachArbiterAudio(adapter)
    killAllSound()
    claimVoice(makeVoice('A'))
    vi.advanceTimersByTime(SUSPEND_AFTER_MS * 2)
    expect(adapter.log).not.toContain('suspend')
    expect(adapter.log).toContain('resume')
    vi.useRealTimers()
  })

  it('is safe with no adapter', () => {
    vi.useFakeTimers()
    expect(() => killAllSound()).not.toThrow()
    vi.advanceTimersByTime(SUSPEND_AFTER_MS)
    vi.useRealTimers()
  })
})

describe('setMasterVolume', () => {
  it('clamps to 0..1 and drives the bus', () => {
    const adapter = makeAdapter()
    attachArbiterAudio(adapter)
    setMasterVolume(0.5)
    setMasterVolume(2)
    setMasterVolume(-1)
    expect(adapter.log).toEqual(['gain:1', 'gain:0.5', 'gain:1', 'gain:0'])
    expect(getArbiterState().volume).toBe(0)
  })

  it('holds the value with no adapter, and applies it on attach', () => {
    setMasterVolume(0.25)
    const adapter = makeAdapter()
    attachArbiterAudio(adapter)
    expect(adapter.log).toEqual(['gain:0.25'])
  })
})

describe('subscribeArbiter', () => {
  it('notifies on every change and stops after unsubscribe', () => {
    const seen = vi.fn()
    const off = subscribeArbiter(seen)
    const a = makeVoice('A')
    claimVoice(a)
    expect(seen).toHaveBeenLastCalledWith({ sounding: 'A', volume: 1 })
    setMasterVolume(0.5)
    expect(seen).toHaveBeenLastCalledWith({ sounding: 'A', volume: 0.5 })
    off()
    releaseVoice(a)
    expect(seen).toHaveBeenCalledTimes(2)
  })
})
