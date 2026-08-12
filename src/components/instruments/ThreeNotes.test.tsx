// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { RigAudio } from '../../audio/rig/node'
import { ThreeNotes } from './ThreeNotes'
import type { RigAudioBoot } from './Rig'

afterEach(cleanup)

const makeAudio = () => {
  const setParams: [string, number][] = []
  const oscillators: { freq: number }[] = []
  const ctx = {
    currentTime: 5,
    destination: {},
    createOscillator: () => {
      const rec = { freq: 0 }
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
  return { audio, frames, setParams, oscillators, ctx }
}

const key = (name: string): HTMLElement =>
  // A string name is a full exact accessible-name match, so 'A' ≠ 'A♯'.
  screen.getByRole('button', { name })
const instruction = (): string =>
  document.querySelector('[data-instruction]')?.textContent ?? ''
const heard = (): string => document.querySelector('[data-heard]')?.textContent ?? ''

const playNote = async (name: string): Promise<void> => {
  fireEvent.pointerDown(key(name))
  await act(async () => {})
  fireEvent.pointerUp(key(name))
}

describe('ThreeNotes', () => {
  it('opens on step one with twelve keys and the only rule', () => {
    const { audio } = makeAudio()
    render(<ThreeNotes audio={audio} />)
    expect(document.querySelectorAll('[data-keys] button').length).toBe(12)
    expect(instruction()).toMatch(/you are now in that key/)
    expect(heard()).toContain('—')
  })

  it('the first note names the key and lights the idiomatic seconds', async () => {
    const { audio, frames, setParams, oscillators } = makeAudio()
    render(<ThreeNotes audio={audio} />)
    fireEvent.pointerDown(key('A'))
    await act(async () => {})
    frames.fire()
    expect(new Map(setParams).get('delaySeconds')).toBe(3.5)
    expect(oscillators[0]?.freq).toBeCloseTo(220, 1) // A3
    expect(instruction()).toMatch(/You are in A\./)
    // The minor third from A is C — its tag is lit.
    const tags = Array.from(document.querySelectorAll('[data-key-tag]')).map(
      (t) => t.textContent
    )
    expect(tags[0]).toBe('min 3') // C, a minor third up from A
    expect(tags[1]).toBe('maj 3') // C♯
    expect(tags[4]).toBe('5th') // E
  })

  it('three notes end in silence: record head lifted, keys disabled, clock running', async () => {
    const { audio, frames, setParams, ctx } = makeAudio()
    render(<ThreeNotes audio={audio} />)
    await playNote('A')
    await playNote('C')
    setParams.length = 0
    await playNote('E')
    frames.fire()
    expect(new Map(setParams).get('recordHead')).toBe(0)
    expect(instruction()).toMatch(/Now stop\./)
    expect(key('A').hasAttribute('disabled')).toBe(true)
    expect(heard()).toContain('A  ·  C (minor third)  ·  E (fifth)')
    ctx.currentTime += 10
    frames.fire()
    expect(document.querySelector('[data-silence-say]')?.textContent).toMatch(
      /decay is doing to the top end/
    )
    expect(document.querySelector('[data-silence-count]')?.textContent).toBe('10.0 s')
  })

  it('reset drains the loop honestly and the next first note restores it', async () => {
    const { audio, frames, setParams } = makeAudio()
    render(<ThreeNotes audio={audio} />)
    await playNote('A')
    setParams.length = 0
    fireEvent.click(screen.getByRole('button', { name: 'Start again' }))
    frames.fire()
    const afterReset = new Map(setParams)
    expect(afterReset.get('feedback')).toBe(0)
    expect(afterReset.get('recordHead')).toBe(0.9)
    expect(instruction()).toMatch(/you are now in that key/)
    setParams.length = 0
    await playNote('D')
    frames.fire()
    expect(new Map(setParams).get('feedback')).toBe(0.8)
  })

  it('keyboard operates the keys; extra presses in silence are refused', async () => {
    const { audio } = makeAudio()
    const view = render(<ThreeNotes audio={audio} />)
    fireEvent.keyDown(key('C'), { key: 'Enter' })
    await act(async () => {})
    fireEvent.keyUp(key('C'), { key: 'Enter' })
    fireEvent.keyDown(key('G'), { key: 'x' }) // not an activation key
    fireEvent.keyUp(key('G'), { key: 'x' })
    await playNote('G')
    await playNote('E')
    fireEvent.pointerDown(key('D')) // step 4: refused
    await act(async () => {})
    expect(heard()).not.toContain('D')
    expect(() => view.unmount()).not.toThrow()
  })

  it('a second press of a held key does not double-commit', async () => {
    const { audio } = makeAudio()
    render(<ThreeNotes audio={audio} />)
    fireEvent.pointerDown(key('A'))
    await act(async () => {})
    fireEvent.pointerDown(key('A'))
    await act(async () => {})
    expect(instruction()).toMatch(/You are in A\./)
    fireEvent.pointerLeave(key('A'))
    expect(() => fireEvent.pointerUp(key('A'))).not.toThrow()
  })
})
