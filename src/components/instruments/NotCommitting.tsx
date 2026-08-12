// "Not committing" — the S exercise for grammar lesson 3, and the site's
// most important technique (v2 §1.3): play audibly over the loop while
// nothing enters the tape. The diagnostic is honest measurement, not
// narration: an AnalyserNode on the rig's real output reads WHAT RETURNS
// after you let go of the pad. Record head down → the meter falls silent the
// moment you stop; record head up → the tape answers.
//
// S budget (design-system §4): one control surface (the record-head toggle),
// one diagnostic (the returns meter), four steps.

import * as React from 'react'
import { byteRmsLevel, vuSegments } from '../../audio/math/curves'
import { createRigController, type RigController } from '../../audio/rig/controller'
import { presetParams } from '../../audio/rig/presets'
import type { RigAudio } from '../../audio/rig/node'
import type { RigAudioBoot } from './Rig'

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
  analyser: AnalyserNode
  bytes: Uint8Array<ArrayBuffer>
  pad: { osc: OscillatorNode; gain: GainNode } | null
}

const SEGMENTS = 8

export const NotCommitting: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const [committing, setCommitting] = React.useState(false)
  const [padDown, setPadDown] = React.useState(false)
  const [level, setLevel] = React.useState(0)
  const [ready, setReady] = React.useState(false)

  const liveRef = React.useRef<Live | null>(null)
  const frameRef = React.useRef<unknown>(null)

  // The meter runs on the injected frame scheduler (testing-strategy §6:
  // no ambient timers) — in production the page supplies requestAnimationFrame.
  const meterLoop = React.useCallback((): void => {
    const live = liveRef.current
    if (live) {
      live.analyser.getByteTimeDomainData(live.bytes)
      setLevel(byteRmsLevel(live.bytes))
    }
    frameRef.current = audio.frames.request(meterLoop)
  }, [audio.frames])

  const boot = async (): Promise<Live> => {
    if (liveRef.current) return liveRef.current
    const ctx = audio.getContext()
    const rig = await audio.createRig(ctx)
    const controller = createRigController(
      rig.rigNode,
      audio.frames,
      presetParams('not-committing')
    )
    controller.syncAll()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    rig.client.node.connect(analyser)
    rig.client.node.connect(ctx.destination)
    const live: Live = {
      ctx,
      rig,
      controller,
      analyser,
      bytes: new Uint8Array(analyser.fftSize),
      pad: null,
    }
    liveRef.current = live
    setReady(true)
    meterLoop()
    return live
  }

  const padStart = async (): Promise<void> => {
    const live = await boot()
    if (live.pad) return
    const osc = live.ctx.createOscillator()
    const gain = live.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 220
    gain.gain.value = 0
    osc.connect(gain)
    gain.connect(live.rig.client.node)
    osc.start()
    const t = live.ctx.currentTime
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.5, t + 0.06)
    live.pad = { osc, gain }
    setPadDown(true)
  }

  const padStop = (): void => {
    const live = liveRef.current
    if (!live?.pad) return
    const { osc, gain } = live.pad
    const t = live.ctx.currentTime
    gain.gain.setValueAtTime(gain.gain.value, t)
    gain.gain.linearRampToValueAtTime(0, t + 0.12)
    osc.stop(t + 0.2)
    live.pad = null
    setPadDown(false)
  }

  const toggle = (next: boolean): void => {
    setCommitting(next)
    // The whole lesson in one parameter: the record head.
    liveRef.current?.controller.set({ recordHead: next ? 0.9 : 0 })
  }

  React.useEffect(
    () => () => {
      padStop()
      liveRef.current?.controller.dispose()
      if (frameRef.current !== null) audio.frames.cancel(frameRef.current)
    },
    [] // mount-only by design: cleanup closes over refs
  )

  const lit = vuSegments(level * 3, SEGMENTS) // gain up the RMS for a readable meter
  const returning = !padDown && level > 0.02
  const verdict = !ready
    ? 'Silent until you press the pad.'
    : padDown
      ? committing
        ? 'Sounding — and every note is going onto the tape.'
        : 'Sounding — and the tape is ignoring you.'
      : returning
        ? 'You let go, and the tape is answering: that is what you committed.'
        : committing
          ? 'Nothing back yet — play something to commit it.'
          : 'You let go, and nothing returns. Nothing was committed.'

  return (
    <section aria-label="Not committing — the exercise" data-instrument="not-committing">
      <div role="group" aria-label="Record head">
        <button type="button" aria-pressed={!committing} onClick={() => toggle(false)}>
          Not committing
        </button>
        <button type="button" aria-pressed={committing} onClick={() => toggle(true)}>
          Committing
        </button>
      </div>

      <button
        type="button"
        data-pad
        aria-pressed={padDown}
        aria-label="Tone pad — press and hold to sound"
        onPointerDown={() => void padStart()}
        onPointerUp={padStop}
        onPointerLeave={padStop}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            void padStart()
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') padStop()
        }}
      >
        {padDown ? 'Sounding' : 'Tone pad'}
      </button>

      <div
        role="meter"
        aria-label="What returns from the tape"
        aria-valuemin={0}
        aria-valuemax={SEGMENTS}
        aria-valuenow={lit}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} data-segment={i < lit ? 'lit' : 'dark'} aria-hidden="true">
            {i < lit ? '█' : '░'}
          </span>
        ))}
      </div>

      <p aria-live="polite" data-verdict>
        {verdict}
      </p>
    </section>
  )
}
