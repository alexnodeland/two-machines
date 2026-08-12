import { describe, expect, it } from 'vitest'
import {
  applyRigParam,
  LIMITER_CEILING,
  buildRigPatch,
  hzToSvfCutoffCv,
  PARAM_ROUTES,
  type PatchEngine,
  RIG_MODULES,
  rigCables,
} from './patch'

class FakeEngine implements PatchEngine {
  modules: [string, string][] = []
  cables: [string, string][] = []
  params: [string, string, number][] = []
  output = ''
  add_module(typeId: string, name: string): void {
    this.modules.push([typeId, name])
  }
  connect(from: string, to: string): void {
    this.cables.push([from, to])
  }
  set_param_by_name(node: string, param: string, value: number): void {
    this.params.push([node, param, value])
  }
  set_output(name: string): void {
    this.output = name
  }
}

describe('buildRigPatch — the §2 signal path', () => {
  it('adds every stage of the schematic', () => {
    const engine = new FakeEngine()
    buildRigPatch(engine)
    expect(engine.modules).toEqual(RIG_MODULES.map((m) => [m.type, m.name]))
    // the load-bearing stages, by type
    const types = engine.modules.map(([t]) => t)
    expect(types).toContain('tape_delay')
    expect(types).toContain('saturator')
    expect(types).toContain('limiter')
    expect(types.filter((t) => t === 'vca')).toHaveLength(6)
  })

  it('closes the feedback loop externally — the entire idea', () => {
    const engine = new FakeEngine()
    buildRigPatch(engine)
    // tape → rolloff → saturator → feedback Vca → back into the tape
    expect(engine.cables).toContainEqual(['tape.out', 'rolloff.in'])
    expect(engine.cables).toContainEqual(['rolloff.lp', 'saturator.in'])
    expect(engine.cables).toContainEqual(['saturator.out', 'feedback.in'])
    expect(engine.cables).toContainEqual(['feedback.out', 'tape.in'])
  })

  it('splits the source across both pedals — the two-tap split (ADR-012)', () => {
    const engine = new FakeEngine()
    buildRigPatch(engine, 'audio_in')
    expect(engine.cables).toContainEqual(['audio_in.out', 'recordHead.in'])
    expect(engine.cables).toContainEqual(['audio_in.out', 'monitor.in'])
  })

  it('injects hiss INTO the loop, so it accumulates with the music', () => {
    const engine = new FakeEngine()
    buildRigPatch(engine)
    expect(engine.cables).toContainEqual(['hiss.white', 'hissLevel.in'])
    expect(engine.cables).toContainEqual(['hissLevel.out', 'tape.in'])
  })

  it('disables the internal recirculation and runs the tape fully wet', () => {
    const engine = new FakeEngine()
    buildRigPatch(engine)
    expect(engine.params).toContainEqual(['tape', 'feedback', 0])
    expect(engine.params).toContainEqual(['tape', 'mix', 1])
  })

  it('arms the limiter at the sample-term ceiling (safety, never colour)', () => {
    const engine = new FakeEngine()
    buildRigPatch(engine)
    expect(engine.params).toContainEqual(['limiter', 'threshold', LIMITER_CEILING / 5])
    expect(LIMITER_CEILING).toBeLessThan(1) // under the Web Audio clip point
  })

  it('the limiter is the output — safety, never colour', () => {
    const engine = new FakeEngine()
    buildRigPatch(engine)
    expect(engine.output).toBe('limiter')
    expect(engine.cables).toContainEqual(['master.out', 'limiter.in'])
  })

  it('takes a custom input node name (the quiver#45 seam)', () => {
    expect(rigCables('src')[0]).toEqual(['src.out', 'recordHead.in'])
  })
})

describe('hzToSvfCutoffCv — the inverse of svf’s 20·1000^cv map', () => {
  it('hits the anchors', () => {
    expect(hzToSvfCutoffCv(20)).toBe(0)
    expect(hzToSvfCutoffCv(20000)).toBe(1)
    expect(hzToSvfCutoffCv(20 * Math.sqrt(1000))).toBeCloseTo(0.5, 10)
  })

  it('clamps outside the audio range', () => {
    expect(hzToSvfCutoffCv(5)).toBe(0)
    expect(hzToSvfCutoffCv(40000)).toBe(1)
  })

  it('covers the tape-age span: 16 kHz fresh to 880 Hz worn', () => {
    const fresh = hzToSvfCutoffCv(16000)
    const worn = hzToSvfCutoffCv(880)
    expect(fresh).toBeGreaterThan(worn)
    expect(fresh).toBeLessThan(1)
    expect(worn).toBeGreaterThan(0)
  })
})

describe('applyRigParam', () => {
  it('routes plain params straight through', () => {
    const engine = new FakeEngine()
    applyRigParam(engine, 'feedback', 1.06)
    expect(engine.params).toEqual([['feedback', 'gain', 1.06]])
  })

  it('maps rolloff Hz onto the svf cutoff CV', () => {
    const engine = new FakeEngine()
    applyRigParam(engine, 'rolloffHz', 20000)
    expect(engine.params).toEqual([['rolloff', 'cutoff', 1]])
  })

  it('unrouted params are a deliberate no-op (Q-10)', () => {
    const engine = new FakeEngine()
    applyRigParam(engine, 'wowSeconds', 0.001)
    expect(engine.params).toEqual([])
    expect(PARAM_ROUTES.wowSeconds).toBeNull()
  })

  it('every controller param has an explicit routing decision', () => {
    // no param may be silently forgotten: it is either routed or null-on-purpose
    expect(Object.keys(PARAM_ROUTES).sort()).toEqual(
      [
        'delaySeconds',
        'feedback',
        'recordHead',
        'monitor',
        'loopOut',
        'master',
        'rolloffHz',
        'hissLevel',
        'wowSeconds',
      ].sort()
    )
  })
})
