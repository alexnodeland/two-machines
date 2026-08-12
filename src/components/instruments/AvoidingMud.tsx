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
import type { RigAudioBoot } from './Rig'

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
  t0: number
}

const PRESET = 'mud'

export const AvoidingMud: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const base = presetParams(PRESET)
  const [feedback, setFeedback] = React.useState(base.feedback)
  const [phase, setPhase] = React.useState<MudPhase>('filling')
  const [reading, setReading] = React.useState(mudReading(0))
  const [heldPads, setHeldPads] = React.useState<Record<number, boolean>>({})

  const liveRef = React.useRef<Live | null>(null)
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

  const boot = async (): Promise<Live> => {
    if (liveRef.current) return liveRef.current
    const ctx = audio.getContext()
    const rig = await audio.createRig(ctx)
    const controller = createRigController(rig.rigNode, audio.frames, {
      ...base,
      feedback: feedbackRef.current,
    })
    controller.syncAll()
    rig.client.node.connect(ctx.destination)
    const live: Live = { ctx, rig, controller, t0: ctx.currentTime }
    liveRef.current = live
    return live
  }

  const padDown = async (index: number): Promise<void> => {
    if (heldRef.current.has(index)) return
    const live = await boot()
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
      liveRef.current?.controller.dispose()
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
