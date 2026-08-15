// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { getArbiterState, resetArbiterForTests } from '../../audio/arbiter'
import type { RigAudio } from '../../audio/rig/node'
import { BeepingDroning } from './BeepingDroning'
import type { RigAudioBoot } from './Rig'

afterEach(() => {
  cleanup()
  resetArbiterForTests()
  vi.useRealTimers()
})

const makeAudio = () => {
  const setParams: [string, number][] = []
  const oscillators: { freq: number; attackTo: number[]; stopped: boolean }[] = []
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
    currentTime: 10,
    destination: {},
    createOscillator: () => {
      const rec = { freq: 0, attackTo: [] as number[], stopped: false }
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
          linearRampToValueAtTime: vi.fn((v: number) => {
            oscillators[oscillators.length - 1]?.attackTo.push(v)
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
  let boots = 0
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
    createRig: () => {
      boots++
      return Promise.resolve(rig)
    },
    frames,
  }
  return {
    audio,
    frames,
    setParams,
    oscillators,
    gains,
    ctx,
    client,
    bus,
    bootCount: () => boots,
  }
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

  it('keyboard plays the pads while focus is inside the section; unmount cleans up', async () => {
    const { audio, oscillators } = makeAudio()
    const view = render(<BeepingDroning audio={audio} />)
    const f3 = pad(/^F3 — tap/)
    f3.focus() // the letter keys ride the bubble from the focused pad
    fireEvent.keyDown(f3, { key: 'g' })
    await act(async () => {})
    expect(oscillators[0]?.freq).toBeCloseTo(261.63, 1) // C4
    fireEvent.keyUp(f3, { key: 'g' })
    fireEvent.keyDown(f3, { key: 'q' }) // not a pad key
    fireEvent.keyUp(f3, { key: 'q' })
    fireEvent.keyDown(f3, { key: 'a', metaKey: true }) // shortcuts pass through
    fireEvent.keyDown(f3, { key: 'a', ctrlKey: true })
    fireEvent.keyDown(f3, { key: 'a', repeat: true }) // key-repeat never restarts
    fireEvent.keyDown(f3, { key: 'x' }) // not an activation key
    fireEvent.keyUp(f3, { key: 'x' })
    expect(oscillators.length).toBe(1)
    fireEvent.keyDown(f3, { key: 'Enter' })
    await act(async () => {})
    fireEvent.keyUp(f3, { key: 'Enter' })
    expect(() => view.unmount()).not.toThrow()
  })

  it('typing outside the instrument never sounds a note; a focused pad still does', async () => {
    const { audio, oscillators } = makeAudio()
    render(
      <>
        <input aria-label="somewhere else on the page" />
        <BeepingDroning audio={audio} />
      </>
    )
    fireEvent.keyDown(screen.getByLabelText('somewhere else on the page'), { key: 'g' })
    await act(async () => {})
    expect(oscillators.length).toBe(0) // no window listener to catch it
    const d3 = pad(/^D3 — tap/)
    d3.focus()
    fireEvent.keyDown(d3, { key: 'g' })
    await act(async () => {})
    expect(oscillators.length).toBe(1)
    expect(oscillators[0]?.freq).toBeCloseTo(261.63, 1) // C4 — the G key's note
    fireEvent.keyUp(d3, { key: 'g' })
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

  it('a pad press claims the arbiter voice; two racing presses share one boot', async () => {
    const { audio, bootCount } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    expect(getArbiterState().sounding).toBeNull()
    fireEvent.pointerDown(pad(/^D3 — tap/))
    fireEvent.pointerDown(pad(/^A4 — tap/)) // races the first boot
    await act(async () => {})
    expect(bootCount()).toBe(1)
    expect(getArbiterState().sounding).toBe('Beeping & droning')
  })

  it('the stop button releases held pads, fades, then wipes and re-arms', async () => {
    vi.useFakeTimers()
    const { audio, client, gains, oscillators, ctx } = makeAudio()
    render(<BeepingDroning audio={audio} />)
    expect(screen.queryByRole('button', { name: /Stop the tape/ })).toBeNull()
    fireEvent.pointerDown(pad(/^D3 — tap/))
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    expect(oscillators[0]?.stopped).toBe(true) // the held note was let go
    expect(pad(/^D3 — tap/).getAttribute('aria-pressed')).toBe('false')
    const fade = gains[0] // boot's output stage, made before any note gain
    expect(fade?.gain.cancelScheduledValues).toHaveBeenCalledWith(ctx.currentTime)
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
    const { audio, client, bus, gains } = makeAudio()
    const view = render(<BeepingDroning audio={audio} />)
    fireEvent.pointerDown(pad(/^D3 — tap/))
    await act(async () => {})
    // The rig plays through its fade stage into the master bus (ADR-047),
    // never straight to the destination.
    expect(gains[0]?.connect).toHaveBeenCalledWith(bus)
    expect(client.node.connect).toHaveBeenCalledWith(gains[0])
    view.unmount()
    expect(client.dispose).toHaveBeenCalledTimes(1)
    expect(getArbiterState().sounding).toBeNull()
  })

  it('unmounting before the re-arm timer leaves the disposed engine alone', async () => {
    vi.useFakeTimers()
    const { audio, client } = makeAudio()
    const view = render(<BeepingDroning audio={audio} />)
    fireEvent.pointerDown(pad(/^D3 — tap/))
    await act(async () => {})
    fireEvent.pointerUp(pad(/^D3 — tap/))
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    view.unmount() // dispose clears its own timer; the orphaned one must bail
    act(() => vi.advanceTimersByTime(500))
    expect(client.reset).not.toHaveBeenCalled()
    expect(client.dispose).toHaveBeenCalledTimes(1)
  })
})
