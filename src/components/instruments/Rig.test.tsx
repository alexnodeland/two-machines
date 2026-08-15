// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RigAudio } from '../../audio/rig/node'
import { claimVoice, getArbiterState, resetArbiterForTests } from '../../audio/arbiter'
import { BENCH_GAP_PX, Rig, type RigAudioBoot } from './Rig'

afterEach(() => {
  cleanup()
  resetArbiterForTests()
})

// jsdom has no PointerEvent: without this, fireEvent.pointer* drops clientX
// and pointerId, which is precisely what the drag logic reads.
class PointerEventPolyfill extends MouseEvent {
  pointerId: number
  constructor(type: string, init: MouseEventInit & { pointerId?: number } = {}) {
    super(type, init)
    this.pointerId = init.pointerId ?? 0
  }
}
window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent

class FakeParam {
  value = 0
  setValueAtTime = vi.fn()
  linearRampToValueAtTime = vi.fn()
  cancelScheduledValues = vi.fn()
}

class FakeOsc {
  type = ''
  frequency = new FakeParam()
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class FakeGain {
  gain = new FakeParam()
  connect = vi.fn()
}

const makeAudio = () => {
  const setParams: [string, number][] = []
  const workletNode = { connect: vi.fn() }
  const oscs: FakeOsc[] = []
  const gains: FakeGain[] = []
  let analyserByte = 128
  const ctx = {
    currentTime: 1,
    destination: { the: 'speakers' },
    createOscillator: () => {
      const o = new FakeOsc()
      oscs.push(o)
      return o
    },
    createGain: () => {
      const g = new FakeGain()
      gains.push(g)
      return g
    },
    createAnalyser: () => ({
      fftSize: 0,
      getByteTimeDomainData: (bytes: Uint8Array) => bytes.fill(analyserByte),
    }),
  }
  const rig = {
    client: { node: workletNode, reset: vi.fn(), dispose: vi.fn() },
    rigNode: { setParam: (name: string, value: number) => setParams.push([name, value]) },
  } as unknown as RigAudio
  let boots = 0
  const bus = { kind: 'bus' } as unknown as AudioNode
  const frames = {
    queue: [] as (() => void)[],
    request(fn: () => void): unknown {
      this.queue.push(fn)
      return this.queue.length
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
    workletNode,
    oscs,
    gains,
    bootCount: () => boots,
    setLevel: (b: number) => {
      analyserByte = b
    },
  }
}

const deck = (): HTMLElement => screen.getByRole('button', { name: /Machine two — drag/ })
const pad = (): HTMLElement => screen.getByRole('button', { name: /Tone pad/ })
const readoutText = (): string =>
  screen.getByText(/cm ·/).textContent?.replace(/\s+/g, ' ') ?? ''

describe('the silent rig', () => {
  it('renders the default 4.2 s at 80 cm with a decaying verdict, silently', () => {
    const { audio, bootCount } = makeAudio()
    render(<Rig audio={audio} />)
    expect(readoutText()).toContain('80.0 cm · 4.20 s')
    expect(readoutText()).toContain('24 repeats') // ln .001 / ln .75
    expect(readoutText()).toContain('accumulating')
    expect(screen.getByText(/Silent until you press the pad/)).toBeTruthy()
    expect(bootCount()).toBe(0) // nothing audio exists yet
  })

  it('decodes URL state on mount, clamped safe', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} query="fb=999&d=3" />)
    expect(readoutText()).toContain('3.00 s')
    expect(readoutText()).toContain('∞ repeats — runaway')
    expect(screen.getByText(/cm ·/).getAttribute('data-runaway')).toBe('true')
  })
})

describe('the hero gesture', () => {
  it('dragging machine two changes the distance at 4 px per cm', () => {
    const { audio } = makeAudio()
    const changes: string[] = []
    render(<Rig audio={audio} onQueryChange={(q) => changes.push(q)} />)
    fireEvent.pointerDown(deck(), { pointerId: 1, clientX: 500 })
    fireEvent.pointerMove(deck(), { pointerId: 1, clientX: 540 }) // +40 px = +10 cm
    expect(readoutText()).toContain('90.0 cm')
    fireEvent.pointerUp(deck(), { pointerId: 1 })
    expect(changes[changes.length - 1]).toContain('d=4.72') // 90 cm at 7½ ips
  })

  it('captures the pointer when the platform offers it', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    const capture = vi.fn()
    ;(deck() as HTMLElement & { setPointerCapture: unknown }).setPointerCapture = capture
    fireEvent.pointerDown(deck(), { pointerId: 7, clientX: 0 })
    expect(capture).toHaveBeenCalledWith(7)
  })

  it('ignores strays: moves without a drag, or from another pointer', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerMove(deck(), { pointerId: 9, clientX: 900 })
    expect(readoutText()).toContain('80.0 cm')
    fireEvent.pointerDown(deck(), { pointerId: 1, clientX: 500 })
    fireEvent.pointerMove(deck(), { pointerId: 2, clientX: 900 })
    expect(readoutText()).toContain('80.0 cm')
    fireEvent.pointerUp(deck(), { pointerId: 2 }) // stray up: drag survives
    fireEvent.pointerMove(deck(), { pointerId: 1, clientX: 504 })
    expect(readoutText()).toContain('81.0 cm')
  })

  it('a drag past the rails clamps to 1.5 s and the bench end', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(deck(), { pointerId: 1, clientX: 0 })
    fireEvent.pointerMove(deck(), { pointerId: 1, clientX: -5000 })
    expect(readoutText()).toContain('1.50 s')
    fireEvent.pointerMove(deck(), { pointerId: 1, clientX: 5000 })
    expect(readoutText()).toContain('152.0 cm')
  })

  it('arrows walk the deck by centimetres; Home and End take the rails', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.keyDown(deck(), { key: 'ArrowRight' })
    expect(readoutText()).toContain('81.0 cm')
    fireEvent.keyDown(deck(), { key: 'ArrowLeft', shiftKey: true })
    expect(readoutText()).toContain('71.0 cm')
    fireEvent.keyDown(deck(), { key: 'End' })
    expect(readoutText()).toContain('152.0 cm')
    fireEvent.keyDown(deck(), { key: 'Home' })
    expect(readoutText()).toContain('28.6 cm')
    fireEvent.keyDown(deck(), { key: 'x' }) // no-op
    expect(readoutText()).toContain('28.6 cm')
  })
})

describe('speed, presets and levels', () => {
  it('changing speed re-reads the same distance as different time', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.click(screen.getByRole('button', { name: '15 ips' }))
    // 4.2 s becomes 80 cm × (1/38.1) — the distance is the invariant... but the
    // safe range clamps: at 15 ips, 80 cm is 2.10 s
    expect(readoutText()).toContain('2.10 s')
  })

  it('presets load and encode into the URL', () => {
    const { audio } = makeAudio()
    const changes: string[] = []
    render(<Rig audio={audio} onQueryChange={(q) => changes.push(q)} />)
    fireEvent.click(screen.getByRole('button', { name: 'mud' }))
    expect(readoutText()).toContain('3.00 s')
    expect(readoutText()).toContain('near unity')
    expect(changes[changes.length - 1]).toContain('fb=0.96')
  })

  it('the playback fader wears the unity mark and flags past-unity', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    const fader = screen.getByLabelText('Playback level')
    fireEvent.change(fader, { target: { value: '1.06' } })
    expect(readoutText()).toContain('∞ repeats — runaway')
    const wrapper = fader.closest('[data-fader]')
    expect(wrapper?.getAttribute('data-past-unity')).toBe('true')
    expect(wrapper?.querySelector('[data-unity-mark]')).toBeTruthy()
  })

  it('every level fader reaches the params', () => {
    const { audio } = makeAudio()
    const changes: string[] = []
    render(<Rig audio={audio} onQueryChange={(q) => changes.push(q)} />)
    for (const [label, key] of [
      ['Record head', 'rec'],
      ['Monitor', 'mon'],
      ['Loop out', 'out'],
      ['Tape age', 'age'],
      ['Master', 'm'],
    ] as const) {
      fireEvent.change(screen.getByLabelText(label), { target: { value: '0.5' } })
      expect(changes[changes.length - 1]).toContain(`${key}=0.5`)
    }
  })
})

describe('the lifecycle (ADR-047)', () => {
  it('pressing the pad claims the one voice', async () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    expect(getArbiterState().sounding).toBe('The Rig')
  })

  it('unmount disposes the worklet — no engine outlives its component', async () => {
    const { audio } = makeAudio()
    const { unmount } = render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    const client = (await audio.createRig(audio.getContext())).client as unknown as {
      dispose: ReturnType<typeof vi.fn>
    }
    unmount()
    expect(client.dispose).toHaveBeenCalled()
    expect(getArbiterState().sounding).toBeNull()
  })

  it('Stop the tape fades now and wipes once the fade has landed', async () => {
    const { audio, gains } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    const client = (await audio.createRig(audio.getContext())).client as unknown as {
      reset: ReturnType<typeof vi.fn>
    }
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    const bus = audio.getOutput(audio.getContext())
    const fade = gains.find((g) => g.connect.mock.calls.some((c) => c[0] === bus))
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 1 + 0.06)
    expect(client.reset).not.toHaveBeenCalled()
    vi.advanceTimersByTime(120)
    expect(client.reset).toHaveBeenCalled()
    expect(fade?.gain.setValueAtTime).toHaveBeenCalledWith(1, 1)
    vi.useRealTimers()
  })

  it('unmount before the re-arm timer skips the wipe', async () => {
    const { audio } = makeAudio()
    const { unmount } = render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    const client = (await audio.createRig(audio.getContext())).client as unknown as {
      reset: ReturnType<typeof vi.fn>
      dispose: ReturnType<typeof vi.fn>
    }
    vi.useFakeTimers()
    fireEvent.click(screen.getByRole('button', { name: /Stop the tape/ }))
    unmount() // dispose clears the timer; the guard would skip anyway
    vi.advanceTimersByTime(500)
    expect(client.reset).not.toHaveBeenCalled()
    expect(client.dispose).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('another voice claiming silences the rig (arbiter handover)', async () => {
    const { audio, gains } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    act(() => {
      claimVoice({ label: 'Other', silence: () => {}, dispose: () => {} })
    })
    const bus = audio.getOutput(audio.getContext())
    const fade = gains.find((g) => g.connect.mock.calls.some((c) => c[0] === bus))
    expect(fade?.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 1 + 0.06)
    expect(getArbiterState().sounding).toBe('Other')
  })
})

describe('the gesture boundary and the pad', () => {
  it('pressing the pad boots audio once, syncs params, and sounds', async () => {
    const { audio, frames, setParams, workletNode, oscs, gains, bootCount } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    expect(bootCount()).toBe(1)
    frames.fire() // the controller's initial syncAll flush
    expect(setParams.map(([n]) => n)).toContain('delaySeconds')
    // The worklet plays through its fade stage into the master bus (ADR-047),
    // never straight to the destination.
    const bus = audio.getOutput(audio.getContext())
    const fade = gains.find((g) => g.connect.mock.calls.some((call) => call[0] === bus))
    expect(fade).toBeDefined()
    expect(workletNode.connect).toHaveBeenCalledWith(fade)
    expect(oscs[0]?.start).toHaveBeenCalled()
    expect(screen.getByRole('button', { name: /Tone pad|Sounding/ }).textContent).toBe(
      'Sounding'
    )
  })

  it('releasing the pad releases the tone; a second press re-boots nothing', async () => {
    const { audio, oscs, bootCount } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    fireEvent.pointerUp(pad())
    expect(oscs[0]?.stop).toHaveBeenCalled()
    fireEvent.pointerDown(pad())
    await screen.findByText(/Sounding/)
    expect(bootCount()).toBe(1)
    expect(oscs).toHaveLength(2)
  })

  it('holding the pad twice does not stack tones; leave releases too', async () => {
    const { audio, oscs } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Sounding/)
    fireEvent.pointerDown(pad()) // second press while sounding: no new osc
    await screen.findByText(/Sounding/)
    expect(oscs).toHaveLength(1)
    fireEvent.pointerLeave(pad())
    expect(oscs[0]?.stop).toHaveBeenCalled()
  })

  it('the pad is keyboard-operable and ignores other keys', async () => {
    const { audio, oscs } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.keyDown(pad(), { key: 'Enter' })
    await screen.findByText(/Sounding/)
    fireEvent.keyUp(pad(), { key: 'Enter' })
    expect(oscs[0]?.stop).toHaveBeenCalled()
    fireEvent.keyDown(pad(), { key: 'x' })
    fireEvent.keyUp(pad(), { key: 'x' })
    expect(oscs).toHaveLength(1)
  })

  it('releasing before audio exists is a safe no-op', () => {
    const { audio } = makeAudio()
    render(<Rig audio={audio} />)
    expect(() => fireEvent.pointerUp(pad())).not.toThrow()
  })

  it('live edits reach the controller after boot', async () => {
    const { audio, frames, setParams } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    frames.fire()
    setParams.length = 0
    fireEvent.change(screen.getByLabelText('Monitor'), { target: { value: '0.5' } })
    fireEvent.click(screen.getByRole('button', { name: 'swells' }))
    frames.fire()
    expect(setParams.map(([n]) => n)).toContain('monitor')
    expect(setParams.map(([n]) => n)).toContain('delaySeconds')
  })

  it('unmounting after boot releases the pad and the controller', async () => {
    const { audio, oscs } = makeAudio()
    const view = render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Sounding/)
    view.unmount()
    expect(oscs[0]?.stop).toHaveBeenCalled()
  })

  it('unmounting the silent rig is clean', () => {
    const { audio } = makeAudio()
    const view = render(<Rig audio={audio} />)
    expect(() => view.unmount()).not.toThrow()
  })
})

describe('the meters and the trace', () => {
  it('VUs read the analysers once audio is live; silent rig shows none', async () => {
    const { audio, frames, setLevel } = makeAudio()
    render(<Rig audio={audio} />)
    expect(screen.queryByRole('meter')).toBeNull() // no meters before audio
    fireEvent.pointerDown(pad())
    await screen.findByText(/Sounding/)
    setLevel(128 + 64) // half scale on both taps
    act(() => frames.fire())
    const meters = screen.getAllByRole('meter')
    expect(meters.length).toBe(2)
    expect(
      Number(
        screen
          .getByRole('meter', { name: 'Into the machines' })
          .getAttribute('aria-valuenow')
      )
    ).toBeGreaterThan(0)
    expect(
      Number(
        screen
          .getByRole('meter', { name: 'What the room hears' })
          .getAttribute('aria-valuenow')
      )
    ).toBeGreaterThan(0)
    // Full scale lights the hot segments at the top of the ladder.
    setLevel(0) // byte 0 = −1.0: peak pegged
    act(() => frames.fire())
    expect(document.querySelectorAll('[data-segment="hot"]').length).toBeGreaterThan(0)
  })

  it('paints the trace runaway-red past unity when a canvas context exists', async () => {
    const calls: string[] = []
    const strokes: string[] = []
    const fake = {
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
      clearRect: () => calls.push('clearRect'),
      beginPath: () => calls.push('beginPath'),
      moveTo: () => calls.push('moveTo'),
      lineTo: () => calls.push('lineTo'),
      stroke(): void {
        strokes.push(String(this.strokeStyle))
      },
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fake as unknown as RenderingContext
    )
    const styles = {
      getPropertyValue: (name: string) => (name === '--runaway' ? '#e2564a' : ''),
    }
    vi.spyOn(window, 'getComputedStyle').mockReturnValue(
      styles as unknown as CSSStyleDeclaration
    )
    const { audio, frames, setLevel } = makeAudio()
    render(<Rig audio={audio} query="fb=1.06" />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Sounding/)
    setLevel(200)
    act(() => frames.fire())
    expect(calls).toContain('clearRect')
    expect(strokes[0]).toBe('#e2564a') // the trace itself, past unity
    // A full window of frames: the trace ring buffer holds its capacity.
    for (let i = 0; i < 245; i++) act(() => frames.fire())
    expect(calls.filter((c) => c === 'clearRect').length).toBeGreaterThan(240)
    vi.restoreAllMocks()
  })

  it('falls back to the token default when --runaway resolves empty', async () => {
    const strokes: string[] = []
    const fake = {
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke(): void {
        strokes.push(String(this.strokeStyle))
      },
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fake as unknown as RenderingContext
    )
    const { audio, frames, setLevel } = makeAudio()
    render(<Rig audio={audio} query="fb=1.06" />) // jsdom: custom props resolve ''
    fireEvent.pointerDown(pad())
    await screen.findByText(/Sounding/)
    setLevel(180)
    act(() => frames.fire())
    expect(strokes[0]?.toLowerCase()).toBe('#a99bff') // FALLBACK voice-three stands in
    vi.restoreAllMocks()
  })
})

describe('the spine follows the running rig', () => {
  const heat = (): string =>
    document.documentElement.style.getPropertyValue('--spine-heat')

  it('stays at the floor while silent, tracks feedback once audio is live', async () => {
    const { audio } = makeAudio()
    const view = render(<Rig audio={audio} query="fb=0.9" />)
    expect(Number(heat() || 0)).toBe(0) // silent: the spine keeps its floor
    fireEvent.pointerDown(pad())
    await screen.findByText(/Sounding/)
    expect(heat()).toBe('0.900')
    view.unmount()
    expect(heat()).toBe('0.000') // back to the floor on leave
  })
})

describe('state persistence for the XS readout', () => {
  // jsdom builds vary on whether window.localStorage exists, so both branches
  // of the persist effect are pinned here explicitly rather than left to the
  // environment.
  it('writes the rig state through the URL codec on every change', () => {
    const store = new Map<string, string>()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, String(v)),
      },
    })
    const { audio } = makeAudio()
    render(<Rig audio={audio} query="d=6.5" />)
    expect(store.get('two-machines:rig')).toBe('d=6.5')
  })

  it('survives storage being unavailable (private mode)', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: () => null,
        setItem: () => {
          throw new Error('denied')
        },
      },
    })
    const { audio } = makeAudio()
    expect(() => render(<Rig audio={audio} />)).not.toThrow()
  })
})

describe('bench constants', () => {
  it('608 px of gap is 152 cm at exactly 4 px per cm', () => {
    expect(BENCH_GAP_PX / 152).toBe(4)
  })
})
