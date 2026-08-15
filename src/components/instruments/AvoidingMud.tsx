// Avoiding mud (grammar lesson 4): deliberate failure, measured. The mud
// preset opens hot — feedback 0.96, record head full — the pads fill the loop,
// the meter reads the same occupancy model as the loop face, and the card's
// narrative advances only when the measurement does: mud is declared when you
// reach it, cleared when the loop has actually thinned. One knob does the
// rescue, which is the lesson.
//
// S budget (design-system §4): one control surface (the playback-level fader;
// the pads are the instrument), one diagnostic (the mud meter), four steps in
// the phase machine's prose.

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
import { mudLessonSay, nextMudPhase, type MudPhase } from '../../audio/rig/mudLesson'
import type { RigAudio } from '../../audio/rig/node'
import { presetParams } from '../../audio/rig/presets'
import { Fader } from '../controls/Fader'
import { SILENCE_FADE_SECONDS, SILENCE_RESET_MS } from './lifecycle'
import type { RigAudioBoot } from './Rig'

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
  t0: number
  /** The instrument's own output stage: silencing ramps this, not the bus. */
  fade: GainNode
  /** The arbiter registration — one voice at a time (ADR-047). */
  voice: Voice
}

const PRESET = 'mud'

export const AvoidingMud: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const base = presetParams(PRESET)
  const [feedback, setFeedback] = React.useState(base.feedback)
  const [phase, setPhase] = React.useState<MudPhase>('filling')
  const [reading, setReading] = React.useState(mudReading(0))
  const [heldPads, setHeldPads] = React.useState<Record<number, boolean>>({})
  const [ready, setReady] = React.useState(false)

  const liveRef = React.useRef<Live | null>(null)
  const bootRef = React.useRef<Promise<Live> | null>(null)
  const rearmRef = React.useRef<number | null>(null)
  const frameRef = React.useRef<unknown>(null)
  const marksRef = React.useRef<LoopMark[]>([])
  const heldRef = React.useRef<
    Map<number, { osc: OscillatorNode; gain: GainNode; mark: LoopMark }>
  >(new Map())
  const feedbackRef = React.useRef(feedback)
  feedbackRef.current = feedback
  const phaseRef = React.useRef(phase)
  phaseRef.current = phase

  const now = (): number => {
    const live = liveRef.current
    return live ? live.ctx.currentTime - live.t0 : 0
  }

  const frameLoop = React.useCallback((): void => {
    const t = now()
    const fb = feedbackRef.current
    marksRef.current = pruneMarks(marksRef.current, t, base.distanceSeconds, fb)
    const { occupancy } = loopFaceState(marksRef.current, t, base.distanceSeconds, fb)
    setReading(mudReading(occupancy))
    const next = nextMudPhase(phaseRef.current, occupancy)
    if (next !== phaseRef.current) setPhase(next)
    frameRef.current = audio.frames.request(frameLoop)
    // base.distanceSeconds is a constant of the preset
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
      marksRef.current = [] // the meter must not read notes the wipe removed
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
        feedback: feedbackRef.current,
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
        voice: { label: 'Avoiding mud', silence, dispose },
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
    const note = PAD_NOTES[index] as (typeof PAD_NOTES)[number]
    const osc = live.ctx.createOscillator()
    const gain = live.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToFreq(note.midi)
    const t = live.ctx.currentTime
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.3, t + 0.008)
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
    const t = live.ctx.currentTime
    held.gain.gain.setValueAtTime(held.gain.gain.value, t)
    held.gain.gain.linearRampToValueAtTime(0, t + 0.14)
    held.osc.stop(t + 0.25)
    held.mark.end = now()
    heldRef.current.delete(index)
    setHeldPads((h) => ({ ...h, [index]: false }))
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
  }, []) // mount-only by design: the loop reads live state through refs

  return (
    <section aria-label="Avoiding mud" data-instrument="avoiding-mud">
      <div data-pads>
        {PAD_NOTES.map((note, index) => (
          <button
            key={index}
            type="button"
            data-pad
            data-held={heldPads[index] === true}
            aria-pressed={heldPads[index] === true}
            aria-label={`${note.n}${Math.floor(note.midi / 12) - 1} — play into the loop`}
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

      <div data-mud>
        <div data-mud-head>
          <span>How full the loop is</span>
          <span data-mud-state data-mud={reading.mud}>
            {reading.state}
          </span>
        </div>
        <p aria-live="polite" data-lesson-say data-phase={phase}>
          {mudLessonSay(phase)}
        </p>
      </div>

      {/* Capped below unity: past-unity belongs to the Rig's own page, not
          this lesson (chapter plan, must-not-imply). */}
      <Fader
        label="Playback level"
        value={feedback}
        min={0}
        max={0.98}
        step={0.01}
        onChange={applyFeedback}
      />
    </section>
  )
}
