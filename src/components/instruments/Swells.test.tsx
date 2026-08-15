// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { getArbiterState, resetArbiterForTests } from '../../audio/arbiter'
import type { RigAudio } from '../../audio/rig/node'
import { Swells } from './Swells'
import type { RigAudioBoot } from './Rig'

afterEach(() => {
  cleanup()
  resetArbiterForTests()
  vi.useRealTimers()
})

const makeAudio = () => {
  const setParams: [string, number][] = []
  const ramps: [number, number][] = [] // [target, atTime]
  const gains: {
    gain: {
      value: number
      setValueAtTime: ReturnType<typeof vi.fn>
      cancelScheduledValues: ReturnType<typeof vi.fn>
      linearRampToValueAtTime: ReturnType<typeof vi.fn>
    }
    connect: ReturnType<typeof vi.fn>
  }[] = []
  let analyserByte = 128
  const analyser = {
    fftSize: 0,
    getByteTimeDomainData: (bytes: Uint8Array) => bytes.fill(analyserByte),
  }
  const ctx = {
    currentTime: 2,
    destination: {},
    createAnalyser: () => analyser,
    createOscillator: () => ({
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => {
      const g = {
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          cancelScheduledValues: vi.fn(),
          linearRampToValueAtTime: vi.fn((v: number, at: number) => {
            ramps.push([v, at])
          }),
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
  return {
    audio,
    frames,
    setParams,
    ramps,
    gains,
    client,
    bus,
    setLevel: (b: number) => {
      analyserByte = b
    },
  }
}

const pad = (): HTMLElement => screen.getByRole('button', { name: /Tone pad/ })
const arrival = (): string => document.querySelector('[data-arrival]')?.textContent ?? ''

describe('Swells', () => {
  it('opens waiting, with the attack fader on the pedal-swell default', () => {
    const { audio } = makeAudio()
    render(<Swells audio={audio} />)
    expect(arrival()).toMatch(/how steeply the sound arrives/)
    expect(screen.getByText('0.60 s')).toBeTruthy()
  })

  it('boots on the swells preset and ramps the note at the chosen attack', async () => {
    const { audio, frames, setParams, ramps } = makeAudio()
    render(<Swells audio={audio} />)
    fireEvent.change(screen.getByLabelText(/Attack/), { target: { value: '1.2' } })
    fireEvent.pointerDown(pad())
    await act(async () => {})
    frames.fire()
    const sent = new Map(setParams)
    expect(sent.get('delaySeconds')).toBe(5)
    expect(sent.get('monitor')).toBe(0.6)
    expect(ramps[0]).toEqual([0.35, 2 + 1.2]) // the swell entry
  })

  it('a slow arrival is named as the entry the machine rewards', async () => {
    const { audio, frames, setLevel } = makeAudio()
    render(<Swells audio={audio} />)
    fireEvent.pointerDown(pad())
    await act(async () => {})
    // Level creeps up a little per frame — a swell.
    for (const b of [130, 132, 134, 136]) {
      setLevel(b)
      frames.fire()
    }
    fireEvent.pointerUp(pad())
    expect(arrival()).toMatch(/a tone, not a clock/)
  })

  it('a steep arrival is named as a committed metronome', async () => {
    const { audio, frames, setLevel } = makeAudio()
    render(<Swells audio={audio} />)
    fireEvent.pointerDown(pad())
    await act(async () => {})
    setLevel(170) // one frame, a third of full scale — a pick
    frames.fire()
    fireEvent.pointerUp(pad())
    expect(arrival()).toMatch(/metronome you did not mean to start/)
    // Trying again re-arms the measurement.
    fireEvent.pointerDown(pad())
    await act(async () => {})
    expect(arrival()).toMatch(/how steeply the sound arrives/)
  })

  it('keyboard, double press, release-before-boot and unmount are safe', async () => {
    const { audio } = makeAudio()
    const view = render(<Swells audio={audio} />)
    expect(() => fireEvent.pointerUp(pad())).not.toThrow()
    fireEvent.keyDown(pad(), { key: ' ' })
    await act(async () => {})
    fireEvent.pointerDown(pad()) // already sounding
    await act(async () => {})
    fireEvent.keyDown(pad(), { key: 'x' })
    fireEvent.keyUp(pad(), { key: 'x' })
    fireEvent.keyUp(pad(), { key: ' ' })
    expect(() => view.unmount()).not.toThrow()
  })

  it('a pad press claims the arbiter voice and plays into the bus, not the room', async () => {
    const { audio, gains, client, bus } = makeAudio()
    render(<Swells audio={audio} />)
    expect(getArbiterState().sounding).toBeNull()
    fireEvent.pointerDown(pad())
    await act(async () => {})
    expect(getArbiterState().sounding).toBe('Swells')
    expect(gains[0]?.connect).toHaveBeenCalledWith(bus) // the fade stage
    expect(client.node.connect).toHaveBeenCalledWith(gains[0])
  })

  it('the stop button releases the pad, fades, then wipes and re-arms', async () => {
    vi.useFakeTimers()
    const { audio, client, gains } = makeAudio()
    render(<Swells audio={audio} />)
    expect(screen.queryByRole('button', { name: /Stop the tape/ })).toBeNull()
    fireEvent.pointerDown(pad())
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    expect(pad().getAttribute('aria-pressed')).toBe('false') // the pad let go
    const fade = gains[0] // boot's output stage, made before the pad gain
    expect(fade?.gain.cancelScheduledValues).toHaveBeenCalledWith(2)
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 2 + 0.06)
    expect(client.reset).not.toHaveBeenCalled() // the wipe waits out the fade
    act(() => vi.advanceTimersByTime(120))
    expect(client.reset).toHaveBeenCalledTimes(1)
    expect(fade?.gain.setValueAtTime).toHaveBeenCalledWith(1, 2)
  })

  it('unmount retires the voice: the engine is disposed and the arbiter cleared', async () => {
    const { audio, client } = makeAudio()
    const view = render(<Swells audio={audio} />)
    fireEvent.pointerDown(pad())
    await act(async () => {})
    view.unmount()
    expect(client.dispose).toHaveBeenCalledTimes(1)
    expect(getArbiterState().sounding).toBeNull()
  })

  it('unmounting before the re-arm timer leaves the disposed engine alone', async () => {
    vi.useFakeTimers()
    const { audio, client } = makeAudio()
    const view = render(<Swells audio={audio} />)
    fireEvent.pointerDown(pad())
    await act(async () => {})
    fireEvent.pointerUp(pad())
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    view.unmount() // dispose clears its own timer; the orphaned one must bail
    act(() => vi.advanceTimersByTime(500))
    expect(client.reset).not.toHaveBeenCalled()
    expect(client.dispose).toHaveBeenCalledTimes(1)
  })
})
