import { describe, expect, it, vi } from 'vitest'
import type { QuiverAudioNode } from '@quiver-dsp/wasm/audio'
import { asPatchEngine, createRigAudio, type QuiverNodeFactory } from './node'
import { RIG_MODULES } from './patch'

// The site's pathPrefix, applied the way gatsby's withPrefix would.
vi.mock('gatsby', () => ({
  withPrefix: (path: string) => `/two-machines${path}`,
}))

class FakeClient {
  calls: unknown[][] = []
  compiled = 0
  node = { fake: 'worklet-node' }
  addModule(typeId: string, name: string): void {
    this.calls.push(['addModule', typeId, name])
  }
  connect(from: string, to: string): void {
    this.calls.push(['connect', from, to])
  }
  setOutput(name: string): void {
    this.calls.push(['setOutput', name])
  }
  setParamByName(nodeId: string, param: string, value: number): void {
    this.calls.push(['setParamByName', nodeId, param, value])
  }
  addAudioInput(): void {
    this.calls.push(['addAudioInput'])
  }
  compile(): Promise<void> {
    this.compiled++
    return Promise.resolve()
  }
}

const asQuiver = (c: FakeClient): QuiverAudioNode => c as unknown as QuiverAudioNode

describe('createRigAudio', () => {
  const setup = async () => {
    const client = new FakeClient()
    const seen: { ctx: unknown; options: unknown }[] = []
    const factory: QuiverNodeFactory = (ctx, options) => {
      seen.push({ ctx, options })
      return Promise.resolve(asQuiver(client))
    }
    const ctx = { fake: 'ctx' } as unknown as AudioContext
    const rig = await createRigAudio(ctx, factory)
    return { client, seen, ctx, rig }
  }

  it('resolves the worklet and wasm URLs through withPrefix (ADR-037)', async () => {
    const { seen, ctx } = await setup()
    expect(seen).toEqual([
      {
        ctx,
        options: {
          workletUrl: '/two-machines/quiver.worklet.js',
          wasmUrl: '/two-machines/quiver_bg.wasm',
        },
      },
    ])
  })

  it('injects the audio input BEFORE building the patch that cables from it', async () => {
    const { client } = await setup()
    const firstAdd = client.calls.findIndex((c) => c[0] === 'addModule')
    expect(client.calls[0]).toEqual(['addAudioInput'])
    expect(firstAdd).toBeGreaterThan(0)
  })

  it('builds the full §2 patch and compiles once', async () => {
    const { client } = await setup()
    const added = client.calls.filter((c) => c[0] === 'addModule').map((c) => c[2])
    expect(added).toEqual(RIG_MODULES.map((m) => m.name))
    expect(client.calls).toContainEqual(['connect', 'feedback.out', 'tape.in'])
    expect(client.calls).toContainEqual(['setOutput', 'limiter'])
    expect(client.compiled).toBe(1)
  })

  it('exposes the client for graph wiring', async () => {
    const { client, rig } = await setup()
    expect(rig.client).toBe(asQuiver(client))
  })

  it('routes controller params through the routing table', async () => {
    const { client, rig } = await setup()
    client.calls = []
    rig.rigNode.setParam('feedback', 1.06)
    rig.rigNode.setParam('delaySeconds', 4.2)
    expect(client.calls).toEqual([
      ['setParamByName', 'feedback', 'gain', 1.06],
      ['setParamByName', 'tape', 'time', 4.2],
    ])
  })

  it('unrouted params stay a no-op end to end (Q-10)', async () => {
    const { client, rig } = await setup()
    client.calls = []
    rig.rigNode.setParam('wowSeconds', 0.001)
    expect(client.calls).toEqual([])
  })
})

describe('asPatchEngine', () => {
  it('maps every PatchEngine call onto the client API', () => {
    const client = new FakeClient()
    const engine = asPatchEngine(asQuiver(client))
    engine.add_module('vca', 'monitor')
    engine.connect('a.out', 'b.in')
    engine.set_param_by_name('tape', 'mix', 1)
    engine.set_output('limiter')
    expect(client.calls).toEqual([
      ['addModule', 'vca', 'monitor'],
      ['connect', 'a.out', 'b.in'],
      ['setParamByName', 'tape', 'mix', 1],
      ['setOutput', 'limiter'],
    ])
  })
})
