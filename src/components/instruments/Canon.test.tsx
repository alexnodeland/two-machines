// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  claimVoice,
  getArbiterState,
  resetArbiterForTests,
  type Voice,
} from '../../audio/arbiter'
import type { RigAudio } from '../../audio/rig/node'
import { Canon } from './Canon'
import type { RigAudioBoot } from './Rig'

afterEach(() => {
  cleanup()
  resetArbiterForTests()
  vi.useRealTimers()
})

const makeAudio = () => {
  const setParams: [string, number][] = []
  const oscillators: { started: boolean; freq: number }[] = []
  const gains: {
    gain: {
      value: number
      setValueAtTime: ReturnType<typeof vi.fn>
      cancelScheduledValues: ReturnType<typeof vi.fn>
      linearRampToValueAtTime: ReturnType<typeof vi.fn>
    }
    connect: ReturnType<typeof vi.fn>
  }[] = []
  const ctx = {
    currentTime: 1,
    destination: {},
    createOscillator: () => {
      const osc = {
        type: '',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: () => {
          osc.started = true
          oscillators.push({ started: true, freq: osc.frequency.value })
        },
        stop: vi.fn(),
        started: false,
      }
      return osc
    },
    createGain: () => {
      const g = {
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }
      gains.push(g)
      return g
    },
  }
  const client = { node: { connect: vi.fn() }, reset: vi.fn(), dispose: vi.fn() }
  const rig = {
    client,
    rigNode: { setParam: (name: string, value: number) => setParams.push([name, value]) },
  } as unknown as RigAudio
  const bus = { kind: 'bus' } as unknown as AudioNode
  const frames = {
    queue: [] as (() => void)[],
    request(fn: () => void): unknown {
      this.queue.push(fn)
      return 1
    },
    cancel(): void {},
    fire(): void {
      const fns = this.queue
      this.queue = []
      fns.forEach((fn) => fn())
    },
  }
  const audio: RigAudioBoot = {
    getContext: () => ctx as unknown as AudioContext,
    getOutput: () => bus,
    createRig: () => Promise.resolve(rig),
    frames,
  }
  return { audio, frames, setParams, oscillators, ctx, gains, client, bus }
}

const verdictTitle = (): string =>
  document.querySelector('[data-verdict] b')?.textContent ?? ''
const ratio = (): string => document.querySelector('[data-ratio]')?.textContent ?? ''

describe('Canon', () => {
  it('opens accumulating at 3 : 4, pricing the realignment', () => {
    const { audio } = makeAudio()
    render(<Canon audio={audio} />)
    expect(verdictTitle()).toBe('accumulating')
    expect(ratio()).toContain('3 : 4')
    expect(ratio()).toContain('returns after 12.00 s')
    expect(screen.getByText(/4 phrases and 3 passes/)).toBeTruthy()
  })

  it('the snap buttons move only the phrase fader', () => {
    const { audio } = makeAudio()
    render(<Canon audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: 'Make it lock' }))
    expect(verdictTitle()).toBe('phase-locked · a canon')
    expect(screen.getByText(/divides T exactly 1 time,/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Half of T' }))
    expect(screen.getByText(/divides T exactly 2 times/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Make it drift' }))
    expect(verdictTitle()).toBe('accumulating')
    expect(ratio()).toContain('13 : 16')
  })

  it('starting the phrase boots the rig with the canon patch and schedules notes', async () => {
    const { audio, frames, setParams, oscillators, ctx } = makeAudio()
    render(<Canon audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    frames.fire()
    const sent = new Map(setParams)
    expect(sent.get('delaySeconds')).toBe(4)
    expect(sent.get('feedback')).toBe(0.72)
    expect(sent.get('recordHead')).toBe(0.9)
    expect(oscillators.length).toBeGreaterThan(0)
    expect(oscillators[0]?.freq).toBeCloseTo(293.66, 1) // D4 — the line's first note
    // Walk the clock through the whole phrase: the line comes out in order,
    // rise, held A, brief B, resolving to A3.
    for (let i = 0; i < 8; i++) {
      ctx.currentTime += 0.5
      frames.fire()
    }
    const line = oscillators.slice(0, 5).map((o) => o.freq)
    expect(line[1]).toBeCloseTo(329.63, 1) // E4
    expect(line[2]).toBeCloseTo(440, 1) // A4 — the held note
    expect(line[3]).toBeCloseTo(493.88, 1) // B4, briefly
    expect(line[4]).toBeCloseTo(220, 1) // A3 — the resolution
  })

  it('stop kills the feedback path so the tape empties honestly', async () => {
    const { audio, frames, setParams } = makeAudio()
    render(<Canon audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    setParams.length = 0
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    frames.fire()
    expect(new Map(setParams).get('feedback')).toBe(0)
    expect(screen.getByRole('button', { name: 'Start the phrase' })).toBeTruthy()
    // Restarting reuses the booted rig and restores the feedback path.
    setParams.length = 0
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    frames.fire()
    expect(new Map(setParams).get('feedback')).toBe(0.72)
  })

  it('the machine-distance fader reaches the engine while playing', async () => {
    const { audio, frames, setParams } = makeAudio()
    render(<Canon audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    setParams.length = 0
    const fader = screen.getByLabelText(/Machine distance/)
    fireEvent.change(fader, { target: { value: '6' } })
    frames.fire()
    expect(new Map(setParams).get('delaySeconds')).toBe(6)
    expect(ratio()).toContain('1 : 2')
  })

  it('paints the timeline, and the playhead appears once the phrase is running', async () => {
    const calls: string[] = []
    const fake = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      clearRect: () => calls.push('clearRect'),
      fillRect: () => calls.push('fillRect'),
      strokeRect: () => calls.push('strokeRect'),
      beginPath: () => calls.push('beginPath'),
      arc: () => calls.push('arc'),
      moveTo: () => calls.push('moveTo'),
      lineTo: () => calls.push('lineTo'),
      fill: () => calls.push('fill'),
      stroke: () => calls.push('stroke'),
      fillText: () => calls.push('fillText'),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fake as unknown as RenderingContext
    )
    const { audio, frames, ctx } = makeAudio()
    render(<Canon audio={audio} />)
    expect(calls).toContain('clearRect') // the mount paint
    calls.length = 0
    frames.fire() // one idle frame
    const idleStrokes = calls.filter((c) => c === 'stroke').length
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    calls.length = 0
    frames.fire() // playhead still ahead of the clock: no line yet
    const preRollStrokes = calls.filter((c) => c === 'stroke').length
    expect(preRollStrokes).toBe(idleStrokes)
    ctx.currentTime += 1
    calls.length = 0
    frames.fire() // now inside the phrase: the playhead line is drawn
    expect(calls.filter((c) => c === 'stroke').length).toBe(idleStrokes + 1)
    vi.restoreAllMocks()
  })

  it('pauses painting while scrolled off-screen; scheduling continues', async () => {
    let intersect: (entries: { isIntersecting: boolean }[]) => void = () => {}
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
          intersect = cb
        }
        observe(): void {}
        disconnect(): void {}
      }
    )
    const calls: string[] = []
    const fake = new Proxy(
      {},
      {
        get: (_, prop) =>
          typeof prop === 'string' && prop === 'canvas'
            ? undefined
            : (...args: unknown[]) => calls.push(String(args.length)),
        set: () => true,
      }
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fake as unknown as RenderingContext
    )
    const { audio, frames, oscillators, ctx } = makeAudio()
    render(<Canon audio={audio} />)
    expect(calls.length).toBeGreaterThan(0) // painted while visible
    intersect([{ isIntersecting: false }])
    calls.length = 0
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    ctx.currentTime += 0.1
    frames.fire()
    expect(calls.length).toBe(0) // no painting off-screen…
    expect(oscillators.length).toBeGreaterThan(0) // …but the notes still play
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('unmounts cleanly, idle or playing', async () => {
    const { audio } = makeAudio()
    const view = render(<Canon audio={audio} />)
    expect(() => view.unmount()).not.toThrow()
    const second = makeAudio()
    const playingView = render(<Canon audio={second.audio} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    expect(() => playingView.unmount()).not.toThrow()
    expect(second.client.dispose).toHaveBeenCalledTimes(1)
    expect(getArbiterState().sounding).toBeNull()
  })

  it('starting the phrase claims the arbiter voice and plays into the bus', async () => {
    const { audio, gains, client, bus } = makeAudio()
    render(<Canon audio={audio} />)
    expect(getArbiterState().sounding).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await screen.findByRole('button', { name: 'Stop' })
    expect(getArbiterState().sounding).toBe('The canon')
    expect(gains[0]?.connect).toHaveBeenCalledWith(bus) // the fade stage
    expect(client.node.connect).toHaveBeenCalledWith(gains[0])
  })

  it('an arbiter handover silences the canon: transport stops, fade lands, tape wiped', async () => {
    vi.useFakeTimers()
    const { audio, frames, setParams, client, gains, ctx } = makeAudio()
    render(<Canon audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await act(async () => {})
    setParams.length = 0
    const other: Voice = { label: 'another voice', silence: vi.fn(), dispose: vi.fn() }
    act(() => claimVoice(other)) // another instrument starts somewhere
    // The phrase scheduler stopped through the ordinary stop path…
    expect(screen.getByRole('button', { name: 'Start the phrase' })).toBeTruthy()
    frames.fire()
    expect(new Map(setParams).get('feedback')).toBe(0)
    // …the fade stage landed…
    const fade = gains[0]
    expect(fade?.gain.cancelScheduledValues).toHaveBeenCalledWith(ctx.currentTime)
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0,
      ctx.currentTime + 0.06
    )
    // …and once it had, the tape was wiped. The silence contract: the fade
    // stage PARKS at 0 — no hiss bed under the voice's new holder…
    expect(client.reset).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(120))
    expect(client.reset).toHaveBeenCalledTimes(1)
    expect(fade?.gain.setValueAtTime).not.toHaveBeenCalledWith(1, ctx.currentTime)
    // …and the next start on this instrument re-arms it as the phrase begins.
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await act(async () => {})
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      ctx.currentTime + 0.02
    )
  })

  it('unmounting before the re-arm timer leaves the disposed engine alone', async () => {
    vi.useFakeTimers()
    const { audio, client } = makeAudio()
    const view = render(<Canon audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: 'Start the phrase' }))
    await act(async () => {})
    const other: Voice = { label: 'another voice', silence: vi.fn(), dispose: vi.fn() }
    act(() => claimVoice(other)) // the handover starts a re-arm timer
    view.unmount() // dispose clears its own timer; the orphaned one must bail
    act(() => vi.advanceTimersByTime(500))
    expect(client.reset).not.toHaveBeenCalled()
    expect(client.dispose).toHaveBeenCalledTimes(1)
  })
})
