// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RigAudio } from '../../audio/rig/node'
import { AvoidingMud } from './AvoidingMud'
import type { RigAudioBoot } from './Rig'

afterEach(cleanup)

const makeAudio = () => {
  const setParams: [string, number][] = []
  const ctx = {
    currentTime: 3,
    destination: {},
    createOscillator: () => ({
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => ({
      gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
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
  return { audio, frames, setParams, ctx }
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
    fireEvent.pointerDown(pad(/^D3/))
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
    fireEvent.pointerDown(pad(/^D3/))
    await act(async () => {})
    ctx.currentTime += 2.7
    frames.fire()
    expect(say()).toMatch(/That is mud/)
    fireEvent.pointerUp(pad(/^D3/))
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
})
