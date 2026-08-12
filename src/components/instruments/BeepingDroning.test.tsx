// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RigAudio } from '../../audio/rig/node'
import { BeepingDroning } from './BeepingDroning'
import type { RigAudioBoot } from './Rig'

afterEach(cleanup)

const makeAudio = () => {
  const setParams: [string, number][] = []
  const oscillators: { freq: number; attackTo: number[] }[] = []
  const ctx = {
    currentTime: 10,
    destination: {},
    createOscillator: () => {
      const rec = { freq: 0, attackTo: [] as number[] }
      oscillators.push(rec)
      return {
        type: '',
        frequency: {
          get value(): number {
            return rec.freq
          },
          set value(v: number) {
            rec.freq = v
          },
        },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      }
    },
    createGain: () => ({
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: (v: number) =>
          oscillators[oscillators.length - 1]?.attackTo.push(v),
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
  return { audio, frames, setParams, oscillators, ctx }
}

const pad = (name: RegExp): HTMLElement => screen.getByRole('button', { name })
const mudSay = (): string => document.querySelector('[data-mud-say]')?.textContent ?? ''
const mudState = (): string =>
  document.querySelector('[data-mud-state]')?.textContent ?? ''

describe('BeepingDroning', () => {
  it('renders eight pads, the beep hint, and an empty meter', () => {
    const { audio } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    expect(document.querySelectorAll('[data-pad]').length).toBe(8)
    expect(screen.getByText(/Tap a pad. Short and far apart/)).toBeTruthy()
    expect(mudState()).toBe('empty')
    expect(mudSay()).toMatch(/Play a few notes/)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBe('0')
  })

  it('a pad press boots the rig on the lesson preset and starts a note', async () => {
    const { audio, frames, setParams, oscillators } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    fireEvent.pointerDown(pad(/^D3 — tap to beep/))
    await act(async () => {})
    frames.fire() // the controller coalesces onto the frame clock
    const sent = new Map(setParams)
    expect(sent.get('delaySeconds')).toBe(4)
    expect(sent.get('feedback')).toBe(0.78)
    expect(oscillators[0]?.freq).toBeCloseTo(146.83, 1) // D3
    expect(oscillators[0]?.attackTo[0]).toBe(0.3) // beep level
  })

  it('droning changes the gesture: slow attack, lower level, its own hint', async () => {
    const { audio, oscillators } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: /Droning/ }))
    expect(screen.getByText(/The arc grows for as long as you hold it/)).toBeTruthy()
    fireEvent.pointerDown(pad(/^A4 — tap/))
    await act(async () => {})
    expect(oscillators[0]?.attackTo[0]).toBe(0.2) // drone level
    fireEvent.pointerUp(pad(/^A4 — tap/)) // the slow drone release
    expect(oscillators[0]?.attackTo).toContain(0)
    fireEvent.click(screen.getByRole('button', { name: /Beeping/ }))
    expect(screen.getByText(/Tap a pad. Short and far apart/)).toBeTruthy()
  })

  it('holding fills the loop and the meter names the regimes honestly', async () => {
    const { audio, frames, ctx } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    fireEvent.pointerDown(pad(/^D3 — tap/))
    await act(async () => {})
    ctx.currentTime += 1
    frames.fire()
    expect(mudState()).toBe('sparse')
    ctx.currentTime += 2.6 // held ~3.6 s of a 4 s pass
    frames.fire()
    expect(mudState()).toBe('mud')
    expect(mudSay()).toMatch(/Stop playing and let it thin out/)
    expect(
      Number(screen.getByRole('meter').getAttribute('aria-valuenow'))
    ).toBeGreaterThan(60)
    fireEvent.pointerUp(pad(/^D3 — tap/))
    ctx.currentTime += 80 // the tape thins out on its own
    frames.fire()
    expect(mudState()).toBe('empty')
    expect(mudSay()).toMatch(/Play a few notes/)
  })

  it('the faders reach the engine live', async () => {
    const { audio, frames, setParams } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    fireEvent.pointerDown(pad(/^D3 — tap/))
    await act(async () => {})
    setParams.length = 0
    fireEvent.change(screen.getByLabelText(/Machine distance/), {
      target: { value: '6' },
    })
    fireEvent.change(screen.getByLabelText(/Playback level/), {
      target: { value: '0.5' },
    })
    frames.fire()
    const sent = new Map(setParams)
    expect(sent.get('delaySeconds')).toBe(6)
    expect(sent.get('feedback')).toBe(0.5)
  })

  it('the mud preset opens hotter, for chapter 3.3', () => {
    const { audio } = makeAudio()
    render(<BeepingDroning audio={audio} preset="mud" />)
    expect(screen.getAllByText('3.00 s').length).toBeGreaterThan(0) // mud distance
    expect(screen.getByText('0.96')).toBeTruthy() // mud feedback
  })

  it('keyboard plays the pads from anywhere; unmount cleans up', async () => {
    const { audio, oscillators } = makeAudio()
    const view = render(<BeepingDroning audio={audio} />)
    fireEvent.keyDown(window, { key: 'g' })
    await act(async () => {})
    expect(oscillators[0]?.freq).toBeCloseTo(261.63, 1) // C4
    fireEvent.keyUp(window, { key: 'g' })
    fireEvent.keyDown(window, { key: 'q' }) // not a pad key
    fireEvent.keyUp(window, { key: 'q' })
    fireEvent.keyDown(window, { key: 'a', metaKey: true }) // shortcuts pass through
    fireEvent.keyDown(pad(/^F3 — tap/), { key: 'x' }) // not an activation key
    fireEvent.keyUp(pad(/^F3 — tap/), { key: 'x' })
    fireEvent.keyDown(pad(/^F3 — tap/), { key: 'Enter' })
    await act(async () => {})
    fireEvent.keyUp(pad(/^F3 — tap/), { key: 'Enter' })
    expect(() => view.unmount()).not.toThrow()
  })

  it('paints the face through the canvas context when one exists', async () => {
    const calls: string[] = []
    const record = (name: string) => () => calls.push(name)
    const fake = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
      font: '',
      textAlign: 'left',
      textBaseline: 'top',
      lineCap: 'butt',
      clearRect: record('clearRect'),
      fillRect: record('fillRect'),
      strokeRect: record('strokeRect'),
      beginPath: record('beginPath'),
      arc: record('arc'),
      moveTo: record('moveTo'),
      lineTo: record('lineTo'),
      fill: record('fill'),
      stroke: record('stroke'),
      fillText: record('fillText'),
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fake as unknown as RenderingContext
    )
    const { audio, frames } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    expect(calls).toContain('clearRect')
    fireEvent.pointerDown(pad(/^D3 — tap/))
    await act(async () => {})
    calls.length = 0
    frames.fire()
    expect(calls.filter((c) => c === 'arc').length).toBeGreaterThan(2) // rings + the held note
    vi.restoreAllMocks()
  })

  it('release before boot and double-press are safe', async () => {
    const { audio } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    expect(() => fireEvent.pointerUp(pad(/^D3 — tap/))).not.toThrow()
    fireEvent.pointerDown(pad(/^D3 — tap/))
    await act(async () => {})
    fireEvent.pointerDown(pad(/^D3 — tap/)) // already held: must not stack
    await act(async () => {})
    fireEvent.pointerLeave(pad(/^D3 — tap/))
  })
})
