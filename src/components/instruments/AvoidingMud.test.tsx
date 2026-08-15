// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { getArbiterState, resetArbiterForTests } from '../../audio/arbiter'
import type { RigAudio } from '../../audio/rig/node'
import { AvoidingMud } from './AvoidingMud'
import type { RigAudioBoot } from './Rig'

afterEach(() => {
  cleanup()
  resetArbiterForTests()
  vi.useRealTimers()
})

const makeAudio = () => {
  const setParams: [string, number][] = []
  const oscillators: { stopped: boolean }[] = []
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
    currentTime: 3,
    destination: {},
    createOscillator: () => {
      const rec = { stopped: false }
      oscillators.push(rec)
      return {
        type: '',
        frequency: { value: 0 },
        connect: vi.fn(),
        start: vi.fn(),
        stop: () => {
          rec.stopped = true
        },
      }
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
      act(() => fns.forEach((fn) => fn()))
    },
  }
  const audio: RigAudioBoot = {
    getContext: () => ctx as unknown as AudioContext,
    getOutput: () => bus,
    createRig: () => Promise.resolve(rig),
    frames,
  }
  return { audio, frames, setParams, ctx, oscillators, gains, client, bus }
}

const pad = (name: RegExp): HTMLElement => screen.getByRole('button', { name })
const say = (): string => document.querySelector('[data-lesson-say]')?.textContent ?? ''
const mudState = (): string =>
  document.querySelector('[data-mud-state]')?.textContent ?? ''

describe('AvoidingMud', () => {
  it('opens in the filling phase, aiming at failure, meter empty', () => {
    const { audio } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    expect(say()).toMatch(/aim is failure/)
    expect(mudState()).toBe('empty')
    expect(document.querySelectorAll('[data-pad]').length).toBe(8)
    // The fader is capped below unity — past-unity belongs to the Rig's page.
    expect(screen.getByLabelText(/Playback level/).getAttribute('max')).toBe('0.98')
  })

  it('boots hot on the mud preset and the phase advances only when measured', async () => {
    const { audio, frames, setParams, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    frames.fire()
    const sent = new Map(setParams)
    expect(sent.get('delaySeconds')).toBe(3)
    expect(sent.get('feedback')).toBe(0.96)
    expect(sent.get('recordHead')).toBe(1)
    expect(say()).toMatch(/aim is failure/) // not mud yet — measured, not assumed
    fireEvent.pointerDown(pad(/^A4/)) // a second pad reuses the booted rig
    await act(async () => {})
    ctx.currentTime += 2.6 // hold ~2.6 s of a 3 s pass: occupancy ≥ 0.85
    frames.fire()
    expect(say()).toMatch(/That is mud/)
    expect(mudState()).toBe('mud')
  })

  it('clearing is heard: release, thin out, and the card says both directions', async () => {
    const { audio, frames, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    ctx.currentTime += 2.7
    frames.fire()
    expect(say()).toMatch(/That is mud/)
    fireEvent.pointerUp(pad(/^C3/))
    // Pull the one knob down; the loop drains fast at low feedback.
    fireEvent.change(screen.getByLabelText(/Playback level/), {
      target: { value: '0.3' },
    })
    ctx.currentTime += 12
    frames.fire()
    expect(say()).toMatch(/crossed it both ways/)
    ctx.currentTime += 1 // refilling later never relabels the run a relapse
    frames.fire()
    expect(say()).toMatch(/crossed it both ways/)
  })

  it('keyboard pads, double press, and unmount are safe', async () => {
    const { audio } = makeAudio()
    const view = render(<AvoidingMud audio={audio} />)
    fireEvent.keyDown(pad(/^A4/), { key: 'Enter' })
    await act(async () => {})
    fireEvent.keyDown(pad(/^A4/), { key: 'x' })
    fireEvent.keyUp(pad(/^A4/), { key: 'x' })
    fireEvent.pointerDown(pad(/^A4/)) // already held
    await act(async () => {})
    fireEvent.keyUp(pad(/^A4/), { key: 'Enter' })
    expect(() => fireEvent.pointerLeave(pad(/^A4/))).not.toThrow()
    expect(() => view.unmount()).not.toThrow()
  })

  it('a pad press claims the arbiter voice and plays into the bus, not the room', async () => {
    const { audio, gains, client, bus } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    expect(getArbiterState().sounding).toBeNull()
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    expect(getArbiterState().sounding).toBe('Avoiding mud')
    expect(gains[0]?.connect).toHaveBeenCalledWith(bus) // the fade stage
    expect(client.node.connect).toHaveBeenCalledWith(gains[0])
  })

  it('the stop button releases held pads, fades, then wipes and re-arms', async () => {
    vi.useFakeTimers()
    const { audio, client, gains, oscillators, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    expect(screen.queryByRole('button', { name: /Stop the tape/ })).toBeNull()
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    expect(oscillators[0]?.stopped).toBe(true) // the held note was let go
    expect(pad(/^C3/).getAttribute('aria-pressed')).toBe('false')
    const fade = gains[0] // boot's output stage, made before any note gain
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0,
      ctx.currentTime + 0.06
    )
    expect(client.reset).not.toHaveBeenCalled() // the wipe waits out the fade
    act(() => vi.advanceTimersByTime(120))
    expect(client.reset).toHaveBeenCalledTimes(1)
    expect(fade?.gain.setValueAtTime).toHaveBeenCalledWith(1, ctx.currentTime)
  })

  it('unmount retires the voice: the engine is disposed and the arbiter cleared', async () => {
    const { audio, client } = makeAudio()
    const view = render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    view.unmount()
    expect(client.dispose).toHaveBeenCalledTimes(1)
    expect(getArbiterState().sounding).toBeNull()
  })

  it('unmounting before the re-arm timer leaves the disposed engine alone', async () => {
    vi.useFakeTimers()
    const { audio, client } = makeAudio()
    const view = render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    fireEvent.pointerUp(pad(/^C3/))
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    view.unmount() // dispose clears its own timer; the orphaned one must bail
    act(() => vi.advanceTimersByTime(500))
    expect(client.reset).not.toHaveBeenCalled()
    expect(client.dispose).toHaveBeenCalledTimes(1)
  })
})
