// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { getArbiterState, resetArbiterForTests } from '../../audio/arbiter'
import type { RigAudio } from '../../audio/rig/node'
import { NotCommitting } from './NotCommitting'
import type { RigAudioBoot } from './Rig'

afterEach(() => {
  cleanup()
  resetArbiterForTests()
  vi.useRealTimers()
})

const makeAudio = (levelByte = 128) => {
  const setParams: [string, number][] = []
  const workletNode = { connect: vi.fn() }
  const gains: {
    gain: {
      value: number
      setValueAtTime: ReturnType<typeof vi.fn>
      cancelScheduledValues: ReturnType<typeof vi.fn>
      linearRampToValueAtTime: ReturnType<typeof vi.fn>
    }
    connect: ReturnType<typeof vi.fn>
  }[] = []
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
  const client = { node: workletNode, reset: vi.fn(), dispose: vi.fn() }
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
  return { audio, frames, setParams, workletNode, analyser, gains, client, bus }
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
    expect(workletNode.connect).toHaveBeenCalledTimes(2) // analyser + fade stage
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

  it('a pad press claims the arbiter voice and plays into the bus, not the room', async () => {
    const { audio, gains, workletNode, bus } = makeAudio()
    render(<NotCommitting audio={audio} />)
    expect(getArbiterState().sounding).toBeNull()
    fireEvent.pointerDown(pad())
    await screen.findByText(/ignoring you/)
    expect(getArbiterState().sounding).toBe('Not committing')
    expect(gains[0]?.connect).toHaveBeenCalledWith(bus) // the fade stage
    expect(workletNode.connect).toHaveBeenCalledWith(gains[0])
  })

  it('the stop button releases the pad, fades, wipes — and stays muted until the next gesture', async () => {
    vi.useFakeTimers()
    const { audio, client, gains } = makeAudio()
    render(<NotCommitting audio={audio} />)
    expect(screen.queryByRole('button', { name: /Stop the tape/ })).toBeNull()
    fireEvent.pointerDown(pad())
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    expect(pad().getAttribute('aria-pressed')).toBe('false') // the pad let go
    const fade = gains[0] // boot's output stage, made before the pad gain
    expect(fade?.gain.cancelScheduledValues).toHaveBeenCalledWith(1)
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 1 + 0.06)
    expect(client.reset).not.toHaveBeenCalled() // the wipe waits out the fade
    act(() => vi.advanceTimersByTime(120))
    expect(client.reset).toHaveBeenCalledTimes(1)
    // The silence contract: the fade stage PARKS at 0 after the wipe — no
    // hiss bed can sound under whoever claims the voice next…
    expect(fade?.gain.setValueAtTime).not.toHaveBeenCalledWith(1, 1)
    // …and the next gesture on this instrument re-arms it as the note starts.
    fireEvent.pointerDown(pad())
    await act(async () => {})
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 1 + 0.02)
  })

  it('unmount retires the voice: the engine is disposed and the arbiter cleared', async () => {
    const { audio, client } = makeAudio()
    const view = render(<NotCommitting audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/ignoring you/)
    view.unmount()
    expect(client.dispose).toHaveBeenCalledTimes(1)
    expect(getArbiterState().sounding).toBeNull()
  })

  it('unmounting before the re-arm timer leaves the disposed engine alone', async () => {
    vi.useFakeTimers()
    const { audio, client } = makeAudio()
    const view = render(<NotCommitting audio={audio} />)
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
