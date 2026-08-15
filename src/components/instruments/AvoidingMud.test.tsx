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

  it('reads where the notes sit: three register bars, silent while the loop is empty', () => {
    const { audio } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    for (const name of [/Low register/, /Middle register/, /High register/]) {
      expect(screen.getByRole('meter', { name }).getAttribute('aria-valuenow')).toBe('0')
    }
    const verdict = document.querySelector('[data-register-say]')
    expect(verdict?.textContent).toBe('') // an empty loop earns no verdict
    expect(verdict?.getAttribute('data-register-verdict')).toBe('empty')
    expect(verdict?.getAttribute('aria-live')).toBe('polite')
  })

  it('middle-only playing crowds the middle: the bar goes hot and the verdict says so', async () => {
    const { audio, frames, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^D4/))
    await act(async () => {})
    fireEvent.pointerDown(pad(/^E4/))
    await act(async () => {})
    ctx.currentTime += 1.5 // half a pass, both middle pads held
    frames.fire()
    const mid = screen.getByRole('meter', { name: /Middle register/ })
    expect(mid.getAttribute('data-crowded')).toBe('true')
    expect(mid.getAttribute('aria-valuenow')).toBe('100')
    expect(
      screen.getByRole('meter', { name: /Low register/ }).getAttribute('aria-valuenow')
    ).toBe('0')
    expect(document.querySelector('[data-register-say]')?.textContent).toMatch(
      /the mud register/
    )
  })

  it('low and high together read spread — the rescue the lesson teaches', async () => {
    const { audio, frames, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    fireEvent.pointerDown(pad(/^D5/))
    await act(async () => {})
    ctx.currentTime += 1.5
    frames.fire()
    const verdict = document.querySelector('[data-register-say]')
    expect(verdict?.getAttribute('data-register-verdict')).toBe('spread')
    expect(verdict?.textContent).toMatch(/low and high are carrying it/)
    expect(
      screen.getByRole('meter', { name: /Middle register/ }).getAttribute('data-crowded')
    ).toBe('false')
  })

  it('a low drone alone leans — one dominant register is never called mud', async () => {
    const { audio, frames, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    ctx.currentTime += 1.5
    frames.fire()
    const verdict = document.querySelector('[data-register-say]')
    expect(verdict?.getAttribute('data-register-verdict')).toBe('leaning')
    expect(verdict?.textContent).toMatch(/its own room/)
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

  it('the stop button releases held pads, fades, wipes — and stays muted until the next gesture', async () => {
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
    // The silence contract: the fade stage PARKS at 0 after the wipe — no
    // hiss bed can sound under whoever claims the voice next…
    expect(fade?.gain.setValueAtTime).not.toHaveBeenCalledWith(1, ctx.currentTime)
    // …and the next gesture on this instrument re-arms it as the note starts.
    fireEvent.pointerDown(pad(/^C3/))
    await act(async () => {})
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      ctx.currentTime + 0.02
    )
  })

  it('a tap caught mid-boot still sounds, held to the quarter-second floor', async () => {
    const { audio, gains, oscillators, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^C3/))
    fireEvent.pointerDown(pad(/^C3/)) // repeat while pending: one note
    fireEvent.pointerUp(pad(/^C3/)) // released before the boot resolves
    expect(oscillators).toHaveLength(0) // nothing has sounded yet…
    await act(async () => {}) // …the boot lands…
    expect(oscillators).toHaveLength(1) // …and the tap still becomes a note
    // The note lets itself go, but only after the MIN_TAP_SECONDS floor.
    expect(gains[1]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0,
      ctx.currentTime + 0.25 + 0.14
    )
    expect(pad(/^C3/).getAttribute('aria-pressed')).toBe('false')
  })

  it('a warm fast tap is held to the same floor — a 40 ms blip is not a note', async () => {
    const { audio, gains, ctx } = makeAudio()
    render(<AvoidingMud audio={audio} />)
    fireEvent.pointerDown(pad(/^A4/))
    await act(async () => {})
    fireEvent.pointerUp(pad(/^A4/)) // no audio time has passed: deferred
    expect(gains[1]?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      0,
      ctx.currentTime + 0.25 + 0.14
    )
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
