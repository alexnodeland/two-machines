// Beeping and droning (grammar lesson 2; reused by chapter 3.3 with the mud
// preset): Fripp's two registers of gesture, played on tone pads against the
// real rig, with the loop face showing one pass of the tape per revolution and
// the mud meter naming how full the loop is. Ported from
// mockups/m-beeping-droning.html; the marks model and mud thresholds live
// tested in src/audio/rig/loopFace.ts.
//
// M budget (design-system §4): two faders, one mode switch, one visualisation
// (the face), one verdict (the mud meter's say). Pads are the instrument, not
// controls. No guitar, no microphone (Audio engine §4).

import * as React from 'react'
import { claimVoice, retireVoice, type Voice } from '../../audio/arbiter'
import { midiToFreq } from '../../audio/math/curves'
import { createRigController, type RigController } from '../../audio/rig/controller'
import {
  loopFaceState,
  mudReading,
  PAD_NOTES,
  pruneMarks,
  type LoopMark,
} from '../../audio/rig/loopFace'
import type { RigAudio } from '../../audio/rig/node'
import { presetParams } from '../../audio/rig/presets'
import { Fader } from '../controls/Fader'
import { resolveTheme } from './Cycles'
import { SILENCE_FADE_SECONDS, SILENCE_RESET_MS } from './lifecycle'
import { drawLoopFace, type LoopDraw2D } from './loopFaceDraw'
import type { RigAudioBoot } from './Rig'
import { useOnScreen } from './useOnScreen'

interface Held {
  osc: OscillatorNode
  gain: GainNode
  mark: LoopMark
}

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
  /** Audio-clock time when the face started turning. */
  t0: number
  /** The instrument's own output stage: silencing ramps this, not the bus. */
  fade: GainNode
  /** The arbiter registration — one voice at a time (ADR-047). */
  voice: Voice
}

export type Gesture = 'beep' | 'drone'

export const BeepingDroning: React.FC<{
  audio: RigAudioBoot
  preset?: 'beeping' | 'mud'
}> = ({ audio, preset = 'beeping' }) => {
  const base = presetParams(preset)
  const [mode, setMode] = React.useState<Gesture>('beep')
  const [period, setPeriod] = React.useState(base.distanceSeconds)
  const [feedback, setFeedback] = React.useState(base.feedback)
  const [reading, setReading] = React.useState(mudReading(0))
  const [occupancy, setOccupancy] = React.useState(0)
  const [heldPads, setHeldPads] = React.useState<Record<number, boolean>>({})
  const [ready, setReady] = React.useState(false)

  const liveRef = React.useRef<Live | null>(null)
  const bootRef = React.useRef<Promise<Live> | null>(null)
  const rearmRef = React.useRef<number | null>(null)
  const frameRef = React.useRef<unknown>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const onScreen = useOnScreen(canvasRef)
  const marksRef = React.useRef<LoopMark[]>([])
  const heldRef = React.useRef<Map<number, Held>>(new Map())
  const settingsRef = React.useRef({ period, feedback, mode })
  settingsRef.current = { period, feedback, mode }

  const now = (): number => {
    const live = liveRef.current
    return live ? live.ctx.currentTime - live.t0 : 0
  }

  const frameLoop = React.useCallback((): void => {
    const { period: p, feedback: fb } = settingsRef.current
    const t = now()
    marksRef.current = pruneMarks(marksRef.current, t, p, fb)
    const state = loopFaceState(marksRef.current, t, p, fb)
    setReading(mudReading(state.occupancy))
    setOccupancy(state.occupancy)
    // Off-screen pause: only the painting gates on visibility — pruning and
    // the mud reading continue, since the meter is part of the audio UX.
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d') as LoopDraw2D | null
    if (canvas && ctx && onScreen.current) {
      drawLoopFace(
        ctx,
        { width: canvas.width, height: canvas.height },
        resolveTheme(canvas),
        state,
        (t % p) / p
      )
    }
    frameRef.current = audio.frames.request(frameLoop)
  }, [audio.frames])

  /** Let go of every held pad — the oscillators leak without this. */
  const releaseHeld = (): void => {
    for (const index of Array.from(heldRef.current.keys())) padUp(index)
  }

  /** Silence this instrument now (arbiter handover, the stop button, the
   * kill switch): release every held pad, fade the output stage, then wipe
   * the tape and re-arm. Idempotent, and safe after dispose. */
  const silence = (): void => {
    const live = liveRef.current
    /* c8 ignore next -- idempotency guard (Voice contract): no live path calls twice */
    if (!live) return
    releaseHeld()
    const t = live.ctx.currentTime
    live.fade.gain.cancelScheduledValues(t)
    live.fade.gain.setValueAtTime(live.fade.gain.value, t)
    live.fade.gain.linearRampToValueAtTime(0, t + SILENCE_FADE_SECONDS)
    rearmRef.current = window.setTimeout(() => {
      // Only re-arm an engine that is still the mounted one.
      if (liveRef.current !== live) return
      marksRef.current = [] // the face must not show notes the wipe removed
      live.rig.client.reset()
      live.controller.syncAll()
      live.fade.gain.setValueAtTime(1, live.ctx.currentTime)
    }, SILENCE_RESET_MS)
  }

  /** Tear the engine down — unmount or the kill switch. No worklet outlives
   * its component (ADR-047 §2). */
  const dispose = (): void => {
    const live = liveRef.current
    /* c8 ignore next -- idempotency guard (Voice contract): no live path calls twice */
    if (!live) return
    if (rearmRef.current !== null) window.clearTimeout(rearmRef.current)
    releaseHeld()
    live.controller.dispose()
    live.rig.client.dispose()
    liveRef.current = null
    bootRef.current = null
    setReady(false)
  }

  /** The gesture boundary: everything audio is built here, once. The promise
   * is the guard — two gestures racing the first boot share one engine. */
  const boot = (): Promise<Live> => {
    if (bootRef.current) return bootRef.current
    bootRef.current = (async (): Promise<Live> => {
      const ctx = audio.getContext()
      const rig = await audio.createRig(ctx)
      const controller = createRigController(rig.rigNode, audio.frames, {
        ...base,
        distanceSeconds: settingsRef.current.period,
        feedback: settingsRef.current.feedback,
      })
      controller.syncAll()
      const fade = ctx.createGain()
      rig.client.node.connect(fade)
      fade.connect(audio.getOutput(ctx))
      const live: Live = {
        ctx,
        rig,
        controller,
        t0: ctx.currentTime,
        fade,
        voice: { label: 'Beeping & droning', silence, dispose },
      }
      liveRef.current = live
      setReady(true)
      return live
    })()
    return bootRef.current
  }

  const padDown = async (index: number): Promise<void> => {
    if (heldRef.current.has(index)) return
    const live = await boot()
    // Every start gesture claims the voice: whatever else was sounding —
    // here or on another page — fades first, and the context resumes.
    claimVoice(live.voice)
    // Callers guarantee the index: pads map over PAD_NOTES, keys use findIndex.
    const note = PAD_NOTES[index] as (typeof PAD_NOTES)[number]
    const osc = live.ctx.createOscillator()
    const gain = live.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToFreq(note.midi)
    const gesture = settingsRef.current.mode
    const attack = gesture === 'drone' ? 0.35 : 0.008
    const level = gesture === 'drone' ? 0.2 : 0.3
    const t = live.ctx.currentTime
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(level, t + attack)
    osc.connect(gain)
    gain.connect(live.rig.client.node)
    osc.start()
    const mark: LoopMark = { start: now(), end: null, midi: note.midi }
    marksRef.current.push(mark)
    heldRef.current.set(index, { osc, gain, mark })
    setHeldPads((h) => ({ ...h, [index]: true }))
  }

  const padUp = (index: number): void => {
    const held = heldRef.current.get(index)
    if (!held) return
    const live = liveRef.current as Live
    const release = settingsRef.current.mode === 'drone' ? 0.5 : 0.14
    const t = live.ctx.currentTime
    held.gain.gain.setValueAtTime(held.gain.gain.value, t)
    held.gain.gain.linearRampToValueAtTime(0, t + release)
    held.osc.stop(t + release + 0.05)
    held.mark.end = now()
    heldRef.current.delete(index)
    setHeldPads((h) => ({ ...h, [index]: false }))
  }

  const applyPeriod = (value: number): void => {
    setPeriod(value)
    liveRef.current?.controller.set({ distanceSeconds: value })
  }

  const applyFeedback = (value: number): void => {
    setFeedback(value)
    liveRef.current?.controller.set({ feedback: value })
  }

  React.useEffect(() => {
    frameLoop()
    return () => {
      const live = liveRef.current
      if (live) retireVoice(live.voice) // silence + dispose, via the arbiter
      if (frameRef.current !== null) audio.frames.cancel(frameRef.current)
    }
  }, []) // mount-only by design: cleanup closes over refs

  // The A–K keys are scoped to the instrument (ADR-047 launch review): they
  // arrive here by bubbling from whatever is focused INSIDE the section, so
  // typing elsewhere on the page never sounds a note. Tab to a pad and its
  // key still plays it — keyboard is a first-class path (accessibility
  // floor 5). Space and Enter belong to the focused pad's own handlers.
  const byKey = (key: string): number =>
    PAD_NOTES.findIndex((n) => n.key === key.toLowerCase())
  const onSectionKeyDown = (e: React.KeyboardEvent): void => {
    if (e.repeat || e.metaKey || e.ctrlKey) return
    const index = byKey(e.key)
    if (index >= 0) void padDown(index)
  }
  const onSectionKeyUp = (e: React.KeyboardEvent): void => {
    const index = byKey(e.key)
    if (index >= 0) padUp(index)
  }

  return (
    <section
      aria-label="Beeping and droning"
      data-instrument="beeping-droning"
      onKeyDown={onSectionKeyDown}
      onKeyUp={onSectionKeyUp}
    >
      <div role="group" aria-label="Which gesture you are practising" data-modes>
        <button
          type="button"
          aria-pressed={mode === 'beep'}
          onClick={() => setMode('beep')}
        >
          <b>Beeping</b>
          <span>Tap. Short marks, far apart. Playful, legible, easy to keep clean.</span>
        </button>
        <button
          type="button"
          aria-pressed={mode === 'drone'}
          onClick={() => setMode('drone')}
        >
          <b>Droning</b>
          <span>Hold. Long arcs that swallow the ring. Enrapturing, and fills fast.</span>
        </button>
      </div>

      <div data-face>
        <canvas
          ref={canvasRef}
          width={480}
          height={480}
          aria-label="A ring showing one pass of the tape. Notes appear where you played them and fade each time round."
        />
        <div data-face-centre aria-hidden="true">
          <span data-face-period>{period.toFixed(2)} s</span>
          <span data-face-label>one pass</span>
        </div>
      </div>

      <div data-pads>
        {PAD_NOTES.map((note, index) => (
          <button
            key={index}
            type="button"
            data-pad
            data-held={heldPads[index] === true}
            aria-pressed={heldPads[index] === true}
            aria-label={`${note.n} — tap to beep, hold to drone`}
            onPointerDown={() => void padDown(index)}
            onPointerUp={() => padUp(index)}
            onPointerLeave={() => padUp(index)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault()
                void padDown(index)
              }
            }}
            onKeyUp={(e) => {
              if (e.key === ' ' || e.key === 'Enter') padUp(index)
            }}
          >
            {note.n}
            <small>{note.key.toUpperCase()}</small>
          </button>
        ))}
      </div>
      {ready && (
        <button
          type="button"
          data-stop
          onClick={silence}
          aria-label="Stop the tape — fade to silence and wipe the loop"
        >
          Stop the tape
        </button>
      )}
      <p data-hint>
        {mode === 'drone'
          ? 'Hold a pad. The arc grows for as long as you hold it.'
          : 'Tap a pad. Short and far apart. Keys A S D F G H J K.'}
      </p>

      <div data-mud>
        <div data-mud-head>
          <span>How full the loop is</span>
          <span data-mud-state data-mud={reading.mud}>
            {reading.state}
          </span>
        </div>
        <div
          role="meter"
          aria-label="How full the loop is"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(Math.min(1, occupancy) * 100)}
          data-mud={reading.mud}
        >
          <i
            aria-hidden="true"
            style={{ insetInlineEnd: `${100 - Math.min(100, occupancy * 100)}%` }}
          />
        </div>
        <p aria-live="polite" data-mud-say>
          {reading.say}
        </p>
      </div>

      <div data-controls>
        <Fader
          label="Machine distance"
          value={period}
          min={1.5}
          max={8}
          step={0.1}
          format={(v) => `${v.toFixed(2)} s`}
          onChange={applyPeriod}
        />
        {/* No unity mark: this fader is capped below unity by design. */}
        <Fader
          label="Playback level"
          value={feedback}
          min={0}
          max={0.98}
          step={0.01}
          onChange={applyFeedback}
        />
      </div>
    </section>
  )
}
