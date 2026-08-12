// Volume swells and soft attack (grammar lesson 5): every attack committed to
// the loop returns every pass, so enter notes without one. The diagnostic is
// measured, not narrated: an AnalyserNode on the rig's output is read every
// frame, and the steepest per-frame rise while you held the pad is the attack
// now living on the tape (thresholds in src/audio/rig/swellLesson.ts).
//
// S budget (design-system §4): one control surface (the attack fader; the pad
// is the instrument), one diagnostic (the arrival meter and its verdict).

import * as React from 'react'
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
import type { RigAudioBoot } from './Rig'

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
  analyser: AnalyserNode
  bytes: Uint8Array<ArrayBuffer>
}

export const Swells: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const [attack, setAttack] = React.useState(ATTACK_DEFAULT)
  const [padDown, setPadDown] = React.useState(false)
  const [committed, setCommitted] = React.useState(false)
  const [maxRise, setMaxRise] = React.useState(0)

  const liveRef = React.useRef<Live | null>(null)
  const frameRef = React.useRef<unknown>(null)
  const padRef = React.useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null)
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

  const boot = async (): Promise<Live> => {
    if (liveRef.current) return liveRef.current
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
    rig.client.node.connect(analyser)
    rig.client.node.connect(ctx.destination)
    const live: Live = {
      ctx,
      rig,
      controller,
      analyser,
      bytes: new Uint8Array(analyser.fftSize),
    }
    liveRef.current = live
    return live
  }

  const padStart = async (): Promise<void> => {
    const live = await boot()
    if (padRef.current) return
    const osc = live.ctx.createOscillator()
    const gain = live.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToFreq(57) // A3 — one note; the entry is the lesson
    const t = live.ctx.currentTime
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.35, t + attackRef.current)
    osc.connect(gain)
    gain.connect(live.rig.client.node)
    osc.start()
    padRef.current = { osc, gain }
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
    pad.osc.stop(t + 0.5)
    padRef.current = null
    measuringRef.current = false
    setPadDown(false)
    setCommitted(true)
  }

  React.useEffect(() => {
    frameLoop()
    return () => {
      padStop()
      liveRef.current?.controller.dispose()
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
