import { describe, expect, it } from 'vitest'
import { ageToCutoff, ageToHiss, ageToWow } from '../math/curves'
import {
  createRigController,
  type EngineParamName,
  type FrameScheduler,
  type RigNode,
  toEngineParams,
} from './controller'
import { defaultParams } from './params'
import { presetParams } from './presets'

class FakeNode implements RigNode {
  calls: [EngineParamName, number][] = []
  setParam(name: string, value: number): void {
    this.calls.push([name as EngineParamName, value])
  }
}

/** Frames advance only when the test says so — rAF by hand. */
class FakeFrames implements FrameScheduler {
  queue: (() => void)[] = []
  cancelled = 0
  request(fn: () => void): unknown {
    this.queue.push(fn)
    return this.queue.length - 1
  }
  cancel(): void {
    this.cancelled++
  }
  fire(): void {
    const fns = this.queue
    this.queue = []
    fns.forEach((fn) => fn())
  }
}

const setup = () => {
  const node = new FakeNode()
  const frames = new FakeFrames()
  const rig = createRigController(node, frames)
  return { node, frames, rig }
}

describe('toEngineParams — the physical→engine mapping', () => {
  it('fans tape age out to three effects at once (Audio engine §3)', () => {
    const p = { ...defaultParams(), tapeAge: 0.6 }
    const engine = toEngineParams(p)
    expect(engine.rolloffHz).toBe(ageToCutoff(0.6))
    expect(engine.wowSeconds).toBe(ageToWow(0.6))
    expect(engine.hissLevel).toBe(ageToHiss(0.6))
  })

  it('passes the physical controls through under engine names', () => {
    const engine = toEngineParams(defaultParams())
    expect(engine.delaySeconds).toBe(4.2)
    expect(engine.feedback).toBe(0.75)
    expect(engine.recordHead).toBe(0.85)
    expect(engine.master).toBe(0.9)
  })
})

describe('coalescing — the §7 requirement', () => {
  it('a drag emits one setParam batch per frame, not one per pointer event', () => {
    const { node, frames, rig } = setup()
    // a continuous gesture: many pointer events inside one frame
    for (let cm = 0; cm < 30; cm++) {
      rig.set({ distanceSeconds: 4.2 + cm * 0.01 })
    }
    expect(node.calls).toHaveLength(0) // nothing sent mid-frame
    frames.fire()
    // one batch: only the one changed engine param, at its final value
    expect(node.calls).toEqual([['delaySeconds', 4.49]])
  })

  it('only changed engine params are sent on a flush', () => {
    const { node, frames, rig } = setup()
    rig.set({ feedback: 1.06 })
    frames.fire()
    expect(node.calls).toEqual([['feedback', 1.06]])
    node.calls = []
    rig.set({ feedback: 1.06 }) // no actual change
    frames.fire()
    expect(node.calls).toEqual([])
  })

  it('schedules at most one pending frame at a time', () => {
    const { frames, rig } = setup()
    rig.set({ feedback: 0.8 })
    rig.set({ monitor: 0.7 })
    expect(frames.queue).toHaveLength(1)
  })
})

describe('presets and URL state through the controller', () => {
  it('loading a preset applies every parameter that differs', () => {
    const { node, frames, rig } = setup()
    rig.applyPreset('mud')
    frames.fire()
    const sent = new Map(node.calls)
    expect(sent.get('delaySeconds')).toBe(3.0)
    expect(sent.get('feedback')).toBe(0.96)
    expect(sent.get('recordHead')).toBe(1.0)
    expect(sent.get('monitor')).toBe(0.7)
    expect(sent.get('rolloffHz')).toBe(ageToCutoff(0.55))
    expect(rig.params).toEqual(presetParams('mud'))
  })

  it('a hand-edited URL with an out-of-range value is clamped before it can reach the node', () => {
    const { node, frames, rig } = setup()
    rig.loadFromQuery('fb=999&d=0')
    frames.fire()
    const sent = new Map(node.calls)
    expect(sent.get('feedback')).toBe(1.18)
    expect(sent.get('delaySeconds')).toBe(1.5)
  })

  it('round-trips its own state through toQuery', () => {
    const { frames, rig } = setup()
    rig.set({ feedback: 1.06, tapeAge: 0.5 })
    frames.fire()
    expect(rig.toQuery()).toBe('fb=1.06&age=0.5')
  })
})

describe('lifecycle', () => {
  it('syncAll pushes every engine param — the initial worklet sync', () => {
    const { node, frames, rig } = setup()
    rig.syncAll()
    frames.fire()
    expect(node.calls).toHaveLength(9) // the full engine param set
  })

  it('set after a flush resends only the delta', () => {
    const { node, frames, rig } = setup()
    rig.syncAll()
    frames.fire()
    node.calls = []
    rig.set({ monitor: 0.5 })
    frames.fire()
    expect(node.calls).toEqual([['monitor', 0.5]])
  })

  it('dispose cancels a pending frame and is safe to call twice', () => {
    const { frames, rig } = setup()
    rig.set({ feedback: 0.8 })
    rig.dispose()
    rig.dispose()
    expect(frames.cancelled).toBe(1)
  })

  it('accepts initial params, validated', () => {
    const node = new FakeNode()
    const frames = new FakeFrames()
    const rig = createRigController(node, frames, { feedback: 99 })
    expect(rig.params.feedback).toBe(1.18)
  })
})
