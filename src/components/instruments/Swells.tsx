// Volume swells and soft attack (grammar lesson 5): every attack committed to
// the loop returns every pass, so enter notes without one. The diagnostic is
// measured, not narrated: an AnalyserNode on the rig's output is read every
// frame, and the steepest per-frame rise while you held the pad is the attack
// now living on the tape (thresholds in src/audio/rig/swellLesson.ts).
//
// S budget (design-system §4): one control surface (the attack fader; the pad
// is the instrument), one diagnostic (the arrival meter and its verdict).

import * as React from 'react'
import { claimVoice, retireVoice, type Voice } from '../../audio/arbiter'
import { byteRmsLevel, midiToFreq } from '../../audio/math/curves'
import { createRigController, type RigController } from '../../audio/rig/controller'
import type { RigAudio } from '../../audio/rig/node'
import { presetParams } from '../../audio/rig/presets'
import {
  ATTACK_DEFAULT,
  ATTACK_MAX,
  ATTACK_MIN,
  swellSay,
  swellVerdict,
} from '../../audio/rig/swellLesson'
import { Fader } from '../controls/Fader'
import { armFade, SILENCE_FADE_SECONDS, SILENCE_RESET_MS } from './lifecycle'
import type { RigAudioBoot } from './Rig'

// The singing wire (Plan-002 Phase B): the pad's one note is A3 twice — a
// sine fundamental plus a triangle a hair sharp — with a vibrato that only
// arrives once the note has already landed, the way a held note starts to
// sing after the hand relaxes.
const PAD_MIDI = 57 // A3 — one note; the entry is the lesson
const WIRE_DETUNE_CENTS = 5
const WIRE_LEVEL = 0.4 // relative to the fundamental
const VIBRATO_HZ = 5
const VIBRATO_DEPTH_CENTS = 3
const VIBRATO_ONSET_SECONDS = 0.8
const VIBRATO_RISE_SECONDS = 1.2

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
  analyser: AnalyserNode
  bytes: Uint8Array<ArrayBuffer>
  /** The instrument's own output stage: silencing ramps this, not the bus. */
  fade: GainNode
  /** The arbiter registration — one voice at a time (ADR-047). */
  voice: Voice
}

export const Swells: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const [attack, setAttack] = React.useState(ATTACK_DEFAULT)
  const [padDown, setPadDown] = React.useState(false)
  const [committed, setCommitted] = React.useState(false)
  const [maxRise, setMaxRise] = React.useState(0)
  const [ready, setReady] = React.useState(false)

  const liveRef = React.useRef<Live | null>(null)
  const bootRef = React.useRef<Promise<Live> | null>(null)
  const rearmRef = React.useRef<number | null>(null)
  const frameRef = React.useRef<unknown>(null)
  const padRef = React.useRef<{ oscs: OscillatorNode[]; gain: GainNode } | null>(null)
  const attackRef = React.useRef(attack)
  attackRef.current = attack
  const lastLevelRef = React.useRef(0)
  const riseRef = React.useRef(0)
  const measuringRef = React.useRef(false)

  const frameLoop = React.useCallback((): void => {
    const live = liveRef.current
    if (live && measuringRef.current) {
      live.analyser.getByteTimeDomainData(live.bytes)
      const level = byteRmsLevel(live.bytes)
      const rise = level - lastLevelRef.current
      lastLevelRef.current = level
      if (rise > riseRef.current) {
        riseRef.current = rise
        setMaxRise(rise)
      }
    }
    frameRef.current = audio.frames.request(frameLoop)
  }, [audio.frames])

  /** Silence this instrument now (arbiter handover, the stop button, the
   * kill switch): release the pad, fade the output stage, then wipe the tape
   * behind it — the stage stays parked at 0 until the next gesture re-arms
   * it. Idempotent, and safe after dispose. */
  const silence = (): void => {
    const live = liveRef.current
    /* c8 ignore next -- idempotency guard (Voice contract): no live path calls twice */
    if (!live) return
    padStop()
    const t = live.ctx.currentTime
    live.fade.gain.cancelScheduledValues(t)
    live.fade.gain.setValueAtTime(live.fade.gain.value, t)
    live.fade.gain.linearRampToValueAtTime(0, t + SILENCE_FADE_SECONDS)
    rearmRef.current = window.setTimeout(() => {
      // Only wipe an engine that is still the mounted one. The fade stage
      // PARKS at 0 — armed but muted — so the wiped tape's hiss bed can
      // never sound under whoever holds the voice now; the next gesture on
      // THIS instrument re-arms it (the silence contract, lifecycle.ts).
      if (liveRef.current !== live) return
      live.rig.client.reset()
      live.controller.syncAll()
    }, SILENCE_RESET_MS)
  }

  /** Tear the engine down — unmount or the kill switch. No worklet outlives
   * its component (ADR-047 §2). */
  const dispose = (): void => {
    const live = liveRef.current
    /* c8 ignore next -- idempotency guard (Voice contract): no live path calls twice */
    if (!live) return
    if (rearmRef.current !== null) window.clearTimeout(rearmRef.current)
    padStop()
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
      const controller = createRigController(
        rig.rigNode,
        audio.frames,
        presetParams('swells')
      )
      controller.syncAll()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      const fade = ctx.createGain()
      rig.client.node.connect(analyser)
      rig.client.node.connect(fade)
      fade.connect(audio.getOutput(ctx))
      const live: Live = {
        ctx,
        rig,
        controller,
        analyser,
        bytes: new Uint8Array(analyser.fftSize),
        fade,
        voice: { label: 'Swells', silence, dispose },
      }
      liveRef.current = live
      setReady(true)
      return live
    })()
    return bootRef.current
  }

  const padStart = async (): Promise<void> => {
    const live = await boot()
    // Every start gesture claims the voice: whatever else was sounding —
    // here or on another page — fades first, and the context resumes.
    claimVoice(live.voice)
    // A parked fade stage (post-silence) re-arms inside the note's attack.
    armFade(live.fade, live.ctx.currentTime)
    if (padRef.current) return
    const t = live.ctx.currentTime
    // The fundamental, and the wire: a triangle a few cents sharp underneath,
    // so the held tone shimmers instead of sitting still.
    const osc = live.ctx.createOscillator()
    const wire = live.ctx.createOscillator()
    const gain = live.ctx.createGain() // the swell envelope — both pass through it
    const wireGain = live.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToFreq(PAD_MIDI)
    wire.type = 'triangle'
    wire.frequency.value = midiToFreq(PAD_MIDI)
    wire.detune.value = WIRE_DETUNE_CENTS
    wireGain.gain.value = WIRE_LEVEL
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.35, t + attackRef.current)
    // Delayed vibrato: depth held at zero until the note has landed, then
    // eased in — the LFO wobbles both oscillators' detune a few cents.
    const lfo = live.ctx.createOscillator()
    const vibrato = live.ctx.createGain()
    lfo.type = 'sine'
    lfo.frequency.value = VIBRATO_HZ
    vibrato.gain.setValueAtTime(0, t)
    vibrato.gain.setValueAtTime(0, t + VIBRATO_ONSET_SECONDS)
    vibrato.gain.linearRampToValueAtTime(
      VIBRATO_DEPTH_CENTS,
      t + VIBRATO_ONSET_SECONDS + VIBRATO_RISE_SECONDS
    )
    lfo.connect(vibrato)
    vibrato.connect(osc.detune)
    vibrato.connect(wire.detune)
    osc.connect(gain)
    wire.connect(wireGain)
    wireGain.connect(gain)
    gain.connect(live.rig.client.node)
    osc.start()
    wire.start()
    lfo.start()
    padRef.current = { oscs: [osc, wire, lfo], gain }
    lastLevelRef.current = 0
    riseRef.current = 0
    measuringRef.current = true
    setMaxRise(0)
    setCommitted(false)
    setPadDown(true)
  }

  const padStop = (): void => {
    const pad = padRef.current
    if (!pad) return
    const live = liveRef.current as Live
    const t = live.ctx.currentTime
    pad.gain.gain.setValueAtTime(pad.gain.gain.value, t)
    pad.gain.gain.linearRampToValueAtTime(0, t + 0.4)
    for (const osc of pad.oscs) osc.stop(t + 0.5) // the LFO too — no leaks
    padRef.current = null
    measuringRef.current = false
    setPadDown(false)
    setCommitted(true)
  }

  React.useEffect(() => {
    frameLoop()
    return () => {
      const live = liveRef.current
      if (live) retireVoice(live.voice) // silence + dispose, via the arbiter
      if (frameRef.current !== null) audio.frames.cancel(frameRef.current)
    }
  }, []) // mount-only by design: the loop reads live state through refs

  const verdict = swellVerdict(maxRise, committed)

  return (
    <section aria-label="Volume swells" data-instrument="swells">
      <button
        type="button"
        data-pad
        aria-pressed={padDown}
        aria-label="Tone pad — hold to sound one note at the chosen attack"
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

      <Fader
        label="Attack"
        value={attack}
        min={ATTACK_MIN}
        max={ATTACK_MAX}
        step={0.005}
        format={(v) => `${v.toFixed(2)} s`}
        onChange={setAttack}
      />

      <p data-arrival data-verdict={verdict} aria-live="polite">
        {swellSay(verdict)}
      </p>
    </section>
  )
}
