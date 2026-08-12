// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import type { Voice } from '../../audio/cycles/presets'
import type { Transport, TransportOptions } from '../../audio/cycles/transport'
import type { StrikeOptions } from '../../audio/cycles/kit'
import {
  Cycles,
  type CyclesAudioDeps,
  DEFAULT_AUDIO_DEPS,
  FALLBACK_THEME,
  paintView,
  resolveTheme,
} from './Cycles'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

class FakeTransport implements Transport {
  playing = false
  bpm = 0
  pulse = false
  started = 0
  stopped = 0
  voicesSet: Voice[][] = []
  bpmSet: number[] = []
  start(): void {
    this.playing = true
    this.started++
  }
  stop(): void {
    this.playing = false
    this.stopped++
  }
  setBpm(b: number): void {
    this.bpm = b
    this.bpmSet.push(b)
  }
  setVoices(vs: Voice[]): void {
    this.voicesSet.push(vs)
  }
  setPulse(): void {}
  pulseNow(): number {
    return 3
  }
  drain(): { voice: number; beat: number; t: number }[] {
    return [{ voice: 0, beat: 0, t: 0 }]
  }
}

const makeDeps = () => {
  const transport = new FakeTransport()
  const strikes: [number, StrikeOptions | undefined][] = []
  let capturedOptions: TransportOptions | null = null
  const deps: CyclesAudioDeps = {
    createTransport: (options) => {
      capturedOptions = options
      return transport
    },
    createKit: () => ({
      strike: (t, opts) => strikes.push([t, opts]),
      out: {} as AudioNode,
    }),
    getContext: () => ({ currentTime: 1.5 }) as unknown as AudioContext,
    now: () => 2,
  }
  return {
    transport,
    strikes,
    deps,
    options: () => {
      if (!capturedOptions) throw new Error('transport not created')
      return capturedOptions
    },
  }
}

describe('rendering and presets', () => {
  it('renders the clapping exercise by default with the ADR-018 readout', () => {
    render(<Cycles />)
    const readouts = within(screen.getByRole('group', { name: 'Readouts' }))
    expect(readouts.getByText('35 pulses')).toBeTruthy() // return
    expect(readouts.getByText('17 pulses')).toBeTruthy() // interlock — never 18
    expect(readouts.getByText('6')).toBeTruthy() // coincidences
  })

  it('falls back to the first preset for an unknown id', () => {
    render(<Cycles preset="nope" />)
    const readouts = within(screen.getByRole('group', { name: 'Readouts' }))
    expect(readouts.getByText('35 pulses')).toBeTruthy()
  })

  it('starting on the drift preset opens on the dials', () => {
    render(<Cycles preset="drift" />)
    expect(
      screen.getByRole('button', { name: 'dials' }).getAttribute('aria-pressed')
    ).toBe('true')
  })

  it('the live summary reports playing, in drift too', () => {
    const { deps } = makeDeps()
    render(<Cycles preset="drift" audio={deps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(screen.getByText(/no exact return, ever. Playing\./)).toBeTruthy()
  })

  it('loads a preset, updating tempo, voices and readouts', () => {
    render(<Cycles />)
    fireEvent.click(screen.getByRole('button', { name: /Frame by Frame/ }))
    expect(screen.getByText('42 pulses')).toBeTruthy()
    expect(screen.getByText(/190 eighths\/min/)).toBeTruthy()
  })

  it('a drift preset lands on the dials view with drift readouts', () => {
    render(<Cycles />)
    fireEvent.click(screen.getByRole('button', { name: /Drift · the same cycle/ }))
    expect(screen.getByText('never')).toBeTruthy()
    const dials = screen.getByRole('button', { name: 'dials' })
    expect(dials.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('the rack is a research instrument', () => {
  it('editing a voice clears the preset label', () => {
    render(<Cycles />)
    const clapsButton = screen.getByRole('button', { name: 'Five against seven' })
    expect(clapsButton.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Five: longer cycle' }))
    expect(clapsButton.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByText(/cycles 6, 7/)).toBeTruthy()
  })

  it('cycle steppers clamp to 1..32 and drop out-of-range hits', () => {
    render(<Cycles />)
    const longer = screen.getByRole('button', { name: 'Five: longer cycle' })
    for (let i = 0; i < 40; i++) fireEvent.click(longer)
    expect(screen.getByLabelText('Five: cycle length').textContent).toBe('32')
    const shorter = screen.getByRole('button', { name: 'Five: shorter cycle' })
    for (let i = 0; i < 40; i++) fireEvent.click(shorter)
    expect(screen.getByLabelText('Five: cycle length').textContent).toBe('1')
  })

  it('hit toggles add, remove, and never leave a voice empty', () => {
    render(<Cycles />)
    const beat2 = screen.getByRole('button', { name: 'Five: beat 2' })
    fireEvent.click(beat2)
    expect(beat2.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(beat2)
    expect(beat2.getAttribute('aria-pressed')).toBe('false')
    // strip every hit: the last removal snaps back to the downbeat
    fireEvent.click(screen.getByRole('button', { name: 'Five: beat 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Five: beat 4' }))
    expect(
      screen.getByRole('button', { name: 'Five: beat 1' }).getAttribute('aria-pressed')
    ).toBe('true')
  })

  it('mute toggles', () => {
    render(<Cycles />)
    const mutes = screen.getAllByRole('button', { name: 'Mute' })
    fireEvent.click(mutes[0] as HTMLElement)
    expect(mutes[0]?.getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(mutes[0] as HTMLElement)
    expect(mutes[0]?.getAttribute('aria-pressed')).toBe('false')
  })
})

describe('modes and views', () => {
  it('drift disables the grid and moves a grid viewer to the dials (ADR-016)', () => {
    render(<Cycles />)
    fireEvent.click(screen.getByRole('button', { name: 'Drift' }))
    const grid = screen.getByRole('button', { name: 'grid' })
    expect((grid as HTMLButtonElement).disabled).toBe(true)
    expect(
      screen.getByRole('button', { name: 'dials' }).getAttribute('aria-pressed')
    ).toBe('true')
    expect(screen.getByText(/no exact return, ever/)).toBeTruthy()
  })

  it('a ribbon viewer entering drift keeps the ribbon', () => {
    render(<Cycles />)
    fireEvent.click(screen.getByRole('button', { name: 'ribbon' }))
    fireEvent.click(screen.getByRole('button', { name: 'Drift' }))
    expect(
      screen.getByRole('button', { name: 'ribbon' }).getAttribute('aria-pressed')
    ).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Offset' }))
    expect(screen.getByText(/exact return every/)).toBeTruthy()
  })
})

describe('transport and audio — the gesture boundary', () => {
  it('creates no audio at render; Play builds the engine and starts', () => {
    const { transport, deps } = makeDeps()
    const createTransport = vi.spyOn({ f: deps.createTransport }, 'f')
    render(<Cycles audio={{ ...deps, createTransport: deps.createTransport }} />)
    expect(transport.started).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(transport.started).toBe(1)
    expect(screen.getByRole('button', { name: 'Stop' })).toBeTruthy()
    void createTransport
  })

  it('Play twice reuses the engine; Stop stops it', () => {
    const { transport, deps } = makeDeps()
    render(<Cycles audio={deps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    fireEvent.click(screen.getByRole('button', { name: 'Stop' }))
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(transport.started).toBe(2)
    expect(transport.stopped).toBeGreaterThanOrEqual(1)
  })

  it('wires the transport clock and timer to real time sources', () => {
    const { deps, options } = makeDeps()
    vi.stubGlobal('setInterval', vi.fn().mockReturnValue(99))
    vi.stubGlobal('clearInterval', vi.fn())
    render(<Cycles audio={deps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    const opts = options()
    expect(opts.clock.now()).toBe(1.5) // the AudioContext clock
    const handle = opts.timer.set(() => undefined, 25)
    opts.timer.clear(handle)
    expect(setInterval).toHaveBeenCalled()
    expect(clearInterval).toHaveBeenCalledWith(99)
  })

  it('strikes the kit per voice timbre, and a lighter tick for the bare pulse', () => {
    const { deps, strikes, options } = makeDeps()
    render(<Cycles audio={deps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    const onFire = options().onFire
    if (!onFire) throw new Error('onFire missing')
    onFire(0, 0, 1.23) // voice one of claps: 1950 Hz
    onFire(null, 0, 2.34) // the bare pulse
    onFire(99, 0, 3.45) // out-of-range voice index: safe no-op
    expect(strikes[0]).toEqual([1.23, { freq: 1950, tone: 0.85 }])
    expect(strikes[1]?.[1]?.freq).toBe(1500)
    expect(strikes).toHaveLength(2)
  })

  it('tempo changes reach a running transport', () => {
    const { transport, deps } = makeDeps()
    render(<Cycles audio={deps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    fireEvent.change(screen.getByLabelText('Tempo'), { target: { value: '120' } })
    expect(transport.bpmSet).toContain(120)
    fireEvent.click(screen.getByRole('button', { name: /Thela/ }))
    expect(transport.bpmSet).toContain(200) // presets retime a running engine
  })

  it('space on the instrument toggles transport; typing space in a control does not', () => {
    const { transport, deps } = makeDeps()
    render(<Cycles audio={deps} />)
    const section = screen.getByLabelText('The Cycles engine')
    fireEvent.keyDown(section, { key: ' ' })
    expect(transport.started).toBe(1)
    fireEvent.keyDown(section, { key: ' ' })
    expect(transport.stopped).toBe(1)
    fireEvent.keyDown(screen.getByRole('button', { name: 'Play' }), { key: ' ' })
    fireEvent.keyDown(section, { key: 'x' })
    expect(transport.started).toBe(1)
  })

  it('paints through a real 2d context when the canvas provides one', () => {
    const { deps } = makeDeps()
    const calls: string[] = []
    const fakeCtx = new Proxy(
      {},
      {
        get: (_t, prop) => {
          if (typeof prop === 'string') {
            return (...args: unknown[]) => {
              calls.push(prop)
              void args
            }
          }
          return undefined
        },
        set: () => true,
      }
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCtx as unknown as RenderingContext
    )
    render(<Cycles audio={deps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(calls).toContain('clearRect')
  })

  it('renders and plays with no 2d context at all — jsdom has none', () => {
    const { deps } = makeDeps()
    render(<Cycles audio={deps} />)
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    ).not.toThrow()
  })

  it('rack edits reach a running transport', () => {
    const { transport, deps } = makeDeps()
    render(<Cycles audio={deps} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    const before = transport.voicesSet.length
    fireEvent.click(screen.getByRole('button', { name: 'Five: longer cycle' }))
    expect(transport.voicesSet.length).toBe(before + 1)
  })

  it('paints the idle view before any gesture, and unmounts cleanly', () => {
    const { deps } = makeDeps()
    const calls: string[] = []
    const fakeCtx = new Proxy(
      {},
      {
        get: (_t, prop) =>
          typeof prop === 'string'
            ? (): void => {
                calls.push(prop)
              }
            : undefined,
        set: () => true,
      }
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      fakeCtx as unknown as RenderingContext
    )
    const { unmount } = render(<Cycles audio={deps} />)
    expect(calls).toContain('clearRect') // the grid teaches before Play
    expect(() => unmount()).not.toThrow()
  })
})

describe('DEFAULT_AUDIO_DEPS', () => {
  it('builds the real engine pieces against the one AudioContext', () => {
    class FakeAudioContext {
      sampleRate = 1000
      currentTime = 7.5
      destination = {}
      createBuffer(_ch: number, length: number) {
        const data = new Float32Array(length)
        return { getChannelData: () => data }
      }
      createGain() {
        return {
          gain: {
            setValueAtTime: () => undefined,
            exponentialRampToValueAtTime: () => undefined,
          },
          connect: (n: unknown) => n,
        }
      }
      createOscillator() {
        return {
          type: '',
          frequency: {
            setValueAtTime: () => undefined,
            exponentialRampToValueAtTime: () => undefined,
          },
          connect: (n: unknown) => n,
          start: () => undefined,
          stop: () => undefined,
        }
      }
      createBufferSource() {
        return {
          buffer: null,
          connect: (n: unknown) => n,
          start: () => undefined,
          stop: () => undefined,
        }
      }
      createBiquadFilter() {
        return {
          type: '',
          frequency: { value: 0 },
          Q: { value: 0 },
          connect: (n: unknown) => n,
        }
      }
    }
    vi.stubGlobal('AudioContext', FakeAudioContext)

    const ctx = DEFAULT_AUDIO_DEPS.getContext()
    expect(DEFAULT_AUDIO_DEPS.now()).toBe(7.5)
    const kit = DEFAULT_AUDIO_DEPS.createKit(ctx as unknown as BaseAudioContext)
    expect(() => kit.strike(0)).not.toThrow()
    const transport = DEFAULT_AUDIO_DEPS.createTransport({
      clock: { now: () => 0 },
      timer: { set: () => 0, clear: () => undefined },
    })
    expect(transport.playing).toBe(false)
  })
})

describe('paintView', () => {
  const recorder = () => {
    const calls: string[] = []
    const ctx = new Proxy(
      {},
      {
        get: (_t, prop) =>
          typeof prop === 'string' ? (): void => void calls.push(prop) : undefined,
        set: () => true,
      }
    )
    return { calls, ctx: ctx as never }
  }
  const size = { width: 100, height: 100 }
  const voices: Voice[] = [
    {
      name: 'a',
      cycle: 4,
      hits: [0],
      rate: 1,
      timbre: { freq: 900, tone: 0.5 },
      muted: false,
      colour: 'brass',
    },
    {
      name: 'b',
      cycle: 3,
      hits: [0],
      rate: 1,
      timbre: { freq: 700, tone: 0.5 },
      muted: false,
      colour: 'aqua',
    },
  ]

  it('routes each view, including the grid refusal in drift', () => {
    for (const view of ['grid', 'ribbon', 'dials'] as const) {
      const { calls } = recorder()
      paintView(recorder().ctx, size, FALLBACK_THEME, view, voices, 'offset', 0, [])
      void calls
    }
    const { calls, ctx } = recorder()
    paintView(ctx, size, FALLBACK_THEME, 'grid', voices, 'drift', 0, [])
    expect(calls).toContain('fillText') // the refusal reason
  })
})

describe('resolveTheme', () => {
  it('falls back to the token hexes when no CSS is loaded', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    expect(resolveTheme(el)).toEqual(FALLBACK_THEME)
  })

  it('reads live custom properties when present', () => {
    const el = document.createElement('div')
    el.style.setProperty('--brass', '#123456')
    document.body.appendChild(el)
    expect(resolveTheme(el).brass).toBe('#123456')
    expect(resolveTheme(el).aqua).toBe(FALLBACK_THEME.aqua)
  })
})
