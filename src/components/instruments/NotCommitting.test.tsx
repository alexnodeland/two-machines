// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RigAudio } from '../../audio/rig/node'
import { NotCommitting } from './NotCommitting'
import type { RigAudioBoot } from './Rig'

afterEach(cleanup)

const makeAudio = (levelByte = 128) => {
  const setParams: [string, number][] = []
  const workletNode = { connect: vi.fn() }
  const analyser = {
    fftSize: 0,
    getByteTimeDomainData: (bytes: Uint8Array) => bytes.fill(levelByte),
  }
  const ctx = {
    currentTime: 1,
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
        linearRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    }),
  }
  const rig = {
    client: { node: workletNode },
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
      fns.forEach((fn) => fn())
    },
  }
  const audio: RigAudioBoot = {
    getContext: () => ctx as unknown as AudioContext,
    createRig: () => Promise.resolve(rig),
    frames,
  }
  return { audio, frames, setParams, workletNode, analyser }
}

const pad = (): HTMLElement => screen.getByRole('button', { name: /Tone pad/ })

describe('NotCommitting', () => {
  it('starts silent, in not-committing, with a dark meter', () => {
    const { audio } = makeAudio()
    render(<NotCommitting audio={audio} />)
    expect(
      screen.getByRole('button', { name: 'Not committing' }).getAttribute('aria-pressed')
    ).toBe('true')
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0')
    expect(screen.getByText(/Silent until you press the pad/)).toBeTruthy()
  })

  it('boots on the pad, syncs the not-committing preset (record head 0)', async () => {
    const { audio, frames, setParams, workletNode } = makeAudio()
    render(<NotCommitting audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/the tape is ignoring you/)
    frames.fire()
    const sent = new Map(setParams)
    expect(sent.get('recordHead')).toBe(0)
    expect(sent.get('delaySeconds')).toBe(4.5)
    expect(workletNode.connect).toHaveBeenCalledTimes(2) // analyser + destination
  })

  it('the toggle moves exactly one parameter: the record head', async () => {
    const { audio, frames, setParams } = makeAudio()
    render(<NotCommitting audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/ignoring you/)
    frames.fire()
    setParams.length = 0
    fireEvent.click(screen.getByRole('button', { name: 'Committing' }))
    await screen.findByText(/going onto the tape/)
    frames.fire()
    expect(setParams).toEqual([['recordHead', 0.9]])
    fireEvent.click(screen.getByRole('button', { name: 'Not committing' }))
    frames.fire()
    expect(setParams).toContainEqual(['recordHead', 0])
  })

  it('verdicts follow the measurement: silence after release means nothing committed', async () => {
    const { audio, frames } = makeAudio(128) // analyser reads silence
    render(<NotCommitting audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/ignoring you/)
    frames.fire() // meter reads silence
    fireEvent.pointerUp(pad())
    await screen.findByText(/nothing returns\. Nothing was committed/)
  })

  it('committing with nothing played yet says so, rather than claiming success', async () => {
    const { audio, frames } = makeAudio(128) // silence: nothing on the tape yet
    render(<NotCommitting audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/ignoring you/)
    fireEvent.click(screen.getByRole('button', { name: 'Committing' }))
    frames.fire()
    fireEvent.pointerUp(pad())
    await screen.findByText(/Nothing back yet — play something to commit it/)
  })

  it('a returning signal after release is named as what you committed', async () => {
    const { audio, frames } = makeAudio(160) // analyser reads real level
    render(<NotCommitting audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/tape is ignoring you/)
    frames.fire() // one meter tick reads the analyser
    fireEvent.pointerUp(pad())
    frames.fire()
    await screen.findByText(/the tape is answering/)
    expect(
      Number(screen.getByRole('meter').getAttribute('aria-valuenow'))
    ).toBeGreaterThan(0)
  })

  it('keyboard operates the pad; unmount cleans up', async () => {
    const { audio } = makeAudio()
    const view = render(<NotCommitting audio={audio} />)
    fireEvent.keyDown(pad(), { key: 'Enter' })
    await screen.findByText(/ignoring you/)
    fireEvent.keyUp(pad(), { key: 'Enter' })
    fireEvent.keyDown(pad(), { key: 'x' })
    fireEvent.keyUp(pad(), { key: 'x' })
    expect(() => view.unmount()).not.toThrow()
  })

  it('releasing before boot is safe; double press does not stack', async () => {
    const { audio } = makeAudio()
    render(<NotCommitting audio={audio} />)
    expect(() => fireEvent.pointerUp(pad())).not.toThrow()
    fireEvent.pointerDown(pad())
    await screen.findByText(/ignoring you/)
    fireEvent.pointerDown(pad())
    // let the second padStart hit the already-sounding guard before releasing
    await act(async () => {})
    fireEvent.pointerLeave(pad())
    await screen.findByText(/nothing returns/)
  })
})
