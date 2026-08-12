// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RigAudio } from '../../audio/rig/node'
import { Swells } from './Swells'
import type { RigAudioBoot } from './Rig'

afterEach(cleanup)

const makeAudio = () => {
  const setParams: [string, number][] = []
  const ramps: [number, number][] = [] // [target, atTime]
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
    createGain: () => ({
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: (v: number, at: number) => ramps.push([v, at]),
      },
      connect: vi.fn(),
    }),
  }
  const rig = {
    client: { node: { connect: vi.fn() } },
    rigNode: { setParam: (name: string, value: number) => setParams.push([name, value]) },
  } as unknown as RigAudio
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
    createRig: () => Promise.resolve(rig),
    frames,
  }
  return {
    audio,
    frames,
    setParams,
    ramps,
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
})
