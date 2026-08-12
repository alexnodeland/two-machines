import { expect, test } from '@playwright/test'
import { toEngineParams } from '../src/audio/rig/controller'
import { sanitizeParams, type RigParams } from '../src/audio/rig/params'
import {
  buildRigPatch,
  LIMITER_CEILING,
  PARAM_ROUTES,
  type PatchEngine,
} from '../src/audio/rig/patch'

// Tier 3 (testing-strategy §2): the Audio engine §8 behavioural contract,
// asserted numerically against offline renders of the REAL quiver patch in a
// real browser. Not counted toward coverage — this is behavioural
// verification. The message lists come from the same modules the site runs,
// so a drift between spec, patch and site cannot hide here.
//
// The §10 staging A/B ran 12 Aug 2026, both engines offline at IDENTICAL
// staging (2 s / fb 0.85 / record 1 / monitor 0 / loopOut 1 / master 0.9 /
// age 0.35; the same 220 Hz, 0.5-amp, 0.9 s note). Oracle echo one 0.768,
// echo two 0.878 — the mockup's echoes GROW, because its unnormalized tanh
// curve adds gain in the mid region. The quiver patch reads 0.456 and
// decays, which is the physically right behaviour for a tape loop below
// unity, so the site's staging stands and the contract asserts the decay.
// (The ≈0.069 previously noted here came from different, unrecorded
// staging and is retired.)

interface WorkletMessage {
  type: string
  [key: string]: unknown
}

/** The exact patch the site builds, as the worklet protocol messages. */
const patchMessages = (partial: Partial<RigParams>): WorkletMessage[] => {
  const messages: WorkletMessage[] = [{ type: 'add_audio_input' }]
  const recorder: PatchEngine = {
    add_module: (typeId, name) =>
      void messages.push({ type: 'add_module', typeId, name }),
    connect: (from, to) => void messages.push({ type: 'connect', from, to }),
    set_param_by_name: (nodeId, paramName, value) =>
      void messages.push({ type: 'set_param_by_name', nodeId, paramName, value }),
    set_output: (name) => void messages.push({ type: 'set_output', name }),
  }
  buildRigPatch(recorder, 'audio_in')

  const engine = toEngineParams(sanitizeParams(partial))
  for (const [name, value] of Object.entries(engine) as [
    keyof typeof PARAM_ROUTES,
    number,
  ][]) {
    const route = PARAM_ROUTES[name]
    if (route) {
      messages.push({
        type: 'set_param_by_name',
        nodeId: route.node,
        paramName: route.param,
        value: route.map ? route.map(value) : value,
      })
    }
  }
  return messages
}

interface Note {
  startS: number
  durS: number
  freq: number
  amp: number
}

interface RenderResult {
  windows: number[]
  overall: number
}

/** Offline-render the patch with an optional enveloped tone, returning
 * windowed peaks. Runs entirely in the page against the deployed assets. */
const renderRig = async (
  page: import('@playwright/test').Page,
  options: {
    params: Partial<RigParams>
    seconds: number
    note: Note | null
    windows: [number, number][]
  }
): Promise<RenderResult> => {
  await page.goto('/two-machines/')
  return page.evaluate(
    async ({ messages, seconds, note, windows }) => {
      const sr = 44100
      const ctx = new OfflineAudioContext(2, Math.ceil(seconds * sr), sr)
      await ctx.audioWorklet.addModule('/two-machines/quiver.worklet.js')
      const wasmBytes = await (await fetch('/two-machines/quiver_bg.wasm')).arrayBuffer()

      const node = new AudioWorkletNode(ctx, 'quiver-processor', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      })
      node.port.start()

      const ready = new Promise<void>((resolve, reject) => {
        node.port.onmessage = (e: MessageEvent) => {
          if (e.data.type === 'ready') resolve()
          if (e.data.type === 'error') reject(new Error(String(e.data.error)))
        }
      })
      node.port.postMessage({ type: 'init', wasmBytes, sampleRate: sr })
      await ready

      const compiled = new Promise<void>((resolve, reject) => {
        node.port.onmessage = (e: MessageEvent) => {
          if (e.data.type === 'compiled') resolve()
          if (e.data.type === 'error') reject(new Error(String(e.data.error)))
        }
      })
      for (const m of messages) node.port.postMessage(m)
      node.port.postMessage({ type: 'compile', requestId: 1 })
      await compiled

      node.connect(ctx.destination)

      if (note) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.frequency.value = note.freq
        gain.gain.value = 0
        osc.connect(gain)
        gain.connect(node)
        gain.gain.setValueAtTime(0, note.startS)
        gain.gain.linearRampToValueAtTime(note.amp, note.startS + 0.01)
        gain.gain.setValueAtTime(note.amp, note.startS + note.durS - 0.01)
        gain.gain.linearRampToValueAtTime(0, note.startS + note.durS)
        osc.start(note.startS)
        osc.stop(note.startS + note.durS + 0.05)
      }

      const buffer = await ctx.startRendering()
      const data = buffer.getChannelData(0)
      const peak = (a: number, b: number): number => {
        let p = 0
        const end = Math.min(data.length, Math.floor(b * sr))
        for (let i = Math.max(0, Math.floor(a * sr)); i < end; i++) {
          const v = Math.abs(data[i] as number)
          if (v > p) p = v
        }
        return p
      }
      return {
        windows: windows.map(([a, b]) => peak(a, b)),
        overall: peak(0, seconds),
      }
    },
    { messages: patchMessages(options.params), ...options }
  )
}

const NOTE: Note = { startS: 0.05, durS: 0.9, freq: 220, amp: 0.5 }

test.describe('the §8 behavioural contract, on the real patch', () => {
  test('silence before input: peak = 0', async ({ page }) => {
    const { overall } = await renderRig(page, {
      params: { tapeAge: 0 }, // age 0: no hiss in the loop
      seconds: 3,
      note: null,
      windows: [],
    })
    expect(overall).toBeLessThan(1e-4)
  })

  test('a 0.9 s note at 0.85 feedback is still audible 2.6 s later', async ({ page }) => {
    const { windows } = await renderRig(page, {
      params: {
        distanceSeconds: 2,
        feedback: 0.85,
        recordHead: 1,
        monitor: 0,
        loopOut: 1,
        tapeAge: 0.35,
      },
      seconds: 6,
      note: NOTE,
      windows: [
        [2.55, 3.05], // 2.6 s after the note began: inside echo one
        [4.55, 5.05], // echo two, one more pass of the tape later
      ],
    })
    const echoOne = windows[0] ?? 0
    const echoTwo = windows[1] ?? 0
    console.log(
      `[tier3] echoes = ${echoOne.toFixed(4)}, ${echoTwo.toFixed(4)} (oracle A/B 12 Aug 2026: 0.768 rising — see header)`
    )
    expect(echoOne).toBeGreaterThan(0.02) // audible
    expect(echoOne).toBeLessThan(0.55) // ≤ the 0.5-amplitude note: no gain in the loop
    // Below unity the train DECAYS — the property the oracle itself fails.
    expect(echoTwo).toBeLessThan(echoOne)
  })

  test('feedback 0: one pass, then silence — and monitor 0 keeps live playing silent', async ({
    page,
  }) => {
    const { windows } = await renderRig(page, {
      params: {
        distanceSeconds: 2,
        feedback: 0,
        recordHead: 1,
        monitor: 0,
        loopOut: 1,
        tapeAge: 0,
      },
      seconds: 7,
      note: NOTE,
      windows: [
        [0.1, 0.9], // while playing: monitor 0 → the room hears nothing yet
        [2.05, 3.05], // the one pass
        [4.5, 6.5], // after it: silence
      ],
    })
    expect(windows[0] ?? 1).toBeLessThan(1e-3)
    expect(windows[1] ?? 0).toBeGreaterThan(0.05)
    expect(windows[2] ?? 1).toBeLessThan(1e-3)
  })

  test('feedback ≥ 1: level is non-decreasing over 10 s', async ({ page }) => {
    const { windows } = await renderRig(page, {
      params: {
        distanceSeconds: 2,
        feedback: 1.06,
        recordHead: 1,
        monitor: 0,
        loopOut: 1,
        tapeAge: 0,
      },
      seconds: 11,
      note: NOTE,
      windows: [
        [2.05, 3.0],
        [4.05, 5.0],
        [6.05, 7.0],
        [8.05, 9.0],
      ],
    })
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i] ?? 0).toBeGreaterThanOrEqual((windows[i - 1] ?? 0) * 0.98)
    }
  })

  test('feedback 1.18: output never exceeds the limiter ceiling', async ({ page }) => {
    const { overall } = await renderRig(page, {
      params: {
        distanceSeconds: 1.5,
        feedback: 1.18,
        recordHead: 1,
        monitor: 0,
        loopOut: 1.2,
        master: 1.2,
        tapeAge: 0,
      },
      seconds: 10,
      note: { ...NOTE, amp: 0.8 },
      windows: [],
    })
    expect(overall).toBeLessThanOrEqual(LIMITER_CEILING + 0.05)
    expect(overall).toBeGreaterThan(0.1) // and it IS running away underneath
  })

  test('recordHead 0: dry audible, nothing enters the loop', async ({ page }) => {
    const { windows } = await renderRig(page, {
      params: {
        distanceSeconds: 2,
        feedback: 0.85,
        recordHead: 0,
        monitor: 1,
        loopOut: 1,
        tapeAge: 0,
      },
      seconds: 6,
      note: NOTE,
      windows: [
        [0.1, 0.9], // the dry path
        [2.05, 5.8], // where echoes would be
      ],
    })
    expect(windows[0] ?? 0).toBeGreaterThan(0.2)
    expect(windows[1] ?? 1).toBeLessThan(1e-3)
  })

  test('tape age 1: measurable high-frequency loss per pass', async ({ page }) => {
    const high: Note = { ...NOTE, freq: 3520 }
    const common = {
      distanceSeconds: 2,
      feedback: 0,
      recordHead: 1,
      monitor: 0,
      loopOut: 1,
    }
    const fresh = await renderRig(page, {
      params: { ...common, tapeAge: 0 },
      seconds: 4,
      note: high,
      windows: [[2.05, 3.05]],
    })
    const worn = await renderRig(page, {
      params: { ...common, tapeAge: 1 },
      seconds: 4,
      note: high,
      windows: [[2.05, 3.05]],
    })
    const freshPeak = fresh.windows[0] ?? 0
    const wornPeak = worn.windows[0] ?? 1
    console.log(
      `[tier3] 3.5 kHz echo: fresh ${freshPeak.toFixed(4)}, worn ${wornPeak.toFixed(4)}`
    )
    expect(freshPeak).toBeGreaterThan(0.05)
    expect(wornPeak).toBeLessThan(freshPeak * 0.5)
  })
})
