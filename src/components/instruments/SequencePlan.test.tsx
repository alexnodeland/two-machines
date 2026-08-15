// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { SequencePlan } from './SequencePlan'
import type { RigAudioBoot } from './Rig'

afterEach(cleanup)

const makeAudio = () => {
  const ctx = { currentTime: 100 }
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
    getOutput: () => ({ kind: 'bus' }) as unknown as AudioNode,
    createRig: () => Promise.reject(new Error('the plan card makes no sound')),
    frames,
  }
  return { audio, frames, ctx }
}

const line = (n: number): HTMLElement => screen.getByLabelText(`Plan line ${n}`)

describe('SequencePlan', () => {
  it('opens in writing mode with six form hints and refuses a one-line plan', () => {
    const { audio } = makeAudio()
    render(<SequencePlan audio={audio} />)
    expect(screen.getAllByRole('textbox').length).toBe(6)
    expect(line(1).getAttribute('placeholder')).toMatch(/^Establish/)
    expect(line(4).getAttribute('placeholder')).toMatch(/^Wait/)
    const perform = screen.getByRole('button', { name: 'Perform the plan' })
    expect(perform.hasAttribute('disabled')).toBe(true)
    fireEvent.change(line(1), { target: { value: 'drone, low register' } })
    expect(screen.getByText(/one line is not a structure/)).toBeTruthy()
    expect(perform.hasAttribute('disabled')).toBe(true)
    fireEvent.change(line(2), { target: { value: 'wait for the fade' } })
    expect(perform.hasAttribute('disabled')).toBe(false)
  })

  it('performs the plan line by line on the shared clock, skipping empty lines', () => {
    const { audio, frames, ctx } = makeAudio()
    render(<SequencePlan audio={audio} />)
    fireEvent.change(line(1), { target: { value: 'establish the drone' } })
    fireEvent.change(line(3), { target: { value: 'improvise sparsely' } })
    fireEvent.change(line(6), { target: { value: 'close with almost nothing' } })
    fireEvent.click(screen.getByRole('button', { name: 'Perform the plan' }))
    expect(screen.getByText(/Line 1 of 3/)).toBeTruthy()
    expect(screen.getByText(/establish the drone/)).toBeTruthy()
    ctx.currentTime += 30
    frames.fire()
    expect(screen.getByText('0:30 on this line')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next line' }))
    expect(screen.getByText(/improvise sparsely/)).toBeTruthy()
    ctx.currentTime += 5
    fireEvent.click(screen.getByRole('button', { name: 'Next line' }))
    expect(screen.getByRole('button', { name: 'Finish' })).toBeTruthy()
    ctx.currentTime += 60
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
    expect(screen.getByText(/3 moves in 1:35/)).toBeTruthy()
    expect(screen.getByText(/line 3 at 1:00 — a real wait/)).toBeTruthy()
    expect(screen.getByText(/close with almost nothing — 1:00/)).toBeTruthy()
  })

  it('after a run the plan can be edited or performed again', () => {
    const { audio, ctx } = makeAudio()
    render(<SequencePlan audio={audio} />)
    fireEvent.change(line(1), { target: { value: 'a' } })
    fireEvent.change(line(2), { target: { value: 'b' } })
    fireEvent.click(screen.getByRole('button', { name: 'Perform the plan' }))
    ctx.currentTime += 3
    fireEvent.click(screen.getByRole('button', { name: 'Next line' }))
    ctx.currentTime += 4
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
    expect(screen.getByText(/brief\. Next run/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Perform it again' }))
    expect(screen.getByText(/Line 1 of 2/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Next line' }))
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
    fireEvent.click(screen.getByRole('button', { name: 'Edit the plan' }))
    expect((line(1) as HTMLInputElement).value).toBe('a') // the plan survives
    const view = render(<SequencePlan audio={makeAudio().audio} />)
    expect(() => view.unmount()).not.toThrow()
  })
})
