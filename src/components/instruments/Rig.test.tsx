// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RigAudio } from '../../audio/rig/node'
import { BENCH_GAP_PX, Rig, type RigAudioBoot } from './Rig'

afterEach(cleanup)

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
  }
  const rig = {
    client: { node: workletNode },
    rigNode: { setParam: (name: string, value: number) => setParams.push([name, value]) },
  } as unknown as RigAudio
  let boots = 0
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
    createRig: () => {
      boots++
      return Promise.resolve(rig)
    },
    frames,
  }
  return { audio, frames, setParams, workletNode, oscs, gains, bootCount: () => boots }
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

describe('the gesture boundary and the pad', () => {
  it('pressing the pad boots audio once, syncs params, and sounds', async () => {
    const { audio, frames, setParams, workletNode, oscs, bootCount } = makeAudio()
    render(<Rig audio={audio} />)
    fireEvent.pointerDown(pad())
    await screen.findByText(/Audio running/)
    expect(bootCount()).toBe(1)
    frames.fire() // the controller's initial syncAll flush
    expect(setParams.map(([n]) => n)).toContain('delaySeconds')
    expect(workletNode.connect).toHaveBeenCalledWith(audio.getContext().destination)
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

describe('bench constants', () => {
  it('608 px of gap is 152 cm at exactly 4 px per cm', () => {
    expect(BENCH_GAP_PX / 152).toBe(4)
  })
})
