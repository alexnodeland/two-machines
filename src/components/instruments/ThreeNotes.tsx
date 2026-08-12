// Three notes and silence (grammar lesson 1): Lamont's grammar as a guided
// four-step card against the real rig. Steps 1–3 commit notes; step 4 lifts
// the record head and the exercise becomes sitting still. Ported from
// mockups/s-three-notes.html; the step machine, suggestions, and coaching
// lines live tested in src/audio/rig/threeNotes.ts.
//
// S budget (design-system §4): four steps, one control surface (the key row),
// one diagnostic (what the tape heard + the silence clock).

import * as React from 'react'
import { midiToFreq } from '../../audio/math/curves'
import { createRigController, type RigController } from '../../audio/rig/controller'
import type { RigAudio } from '../../audio/rig/node'
import { presetParams } from '../../audio/rig/presets'
import {
  BLACK_KEYS,
  commitNote,
  heardReadout,
  initialState,
  instructionFor,
  intervalOf,
  keyName,
  midiFor,
  PITCH_CLASSES,
  shortIntervalName,
  silenceSay,
  SUGGESTIONS,
  type ThreeNotesState,
} from '../../audio/rig/threeNotes'
import type { RigAudioBoot } from './Rig'

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
}

const STEP_LABELS = ['1 · the key', '2 · third or fifth', '3 · resist', '4 · silence']

export const ThreeNotes: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const [state, setState] = React.useState<ThreeNotesState>(initialState)
  const [heldKeys, setHeldKeys] = React.useState<Record<number, boolean>>({})
  const [silenceSeconds, setSilenceSeconds] = React.useState(0)

  const liveRef = React.useRef<Live | null>(null)
  const frameRef = React.useRef<unknown>(null)
  const heldRef = React.useRef<Map<number, { osc: OscillatorNode; gain: GainNode }>>(
    new Map()
  )
  const stateRef = React.useRef(state)
  stateRef.current = state
  const silenceStartRef = React.useRef<number | null>(null)
  const wipedRef = React.useRef(false)

  const boot = async (): Promise<Live> => {
    if (liveRef.current) return liveRef.current
    const ctx = audio.getContext()
    const rig = await audio.createRig(ctx)
    const controller = createRigController(
      rig.rigNode,
      audio.frames,
      presetParams('three-notes')
    )
    controller.syncAll()
    rig.client.node.connect(ctx.destination)
    const live: Live = { ctx, rig, controller }
    liveRef.current = live
    return live
  }

  const frameLoop = React.useCallback((): void => {
    const live = liveRef.current
    if (live && silenceStartRef.current !== null) {
      setSilenceSeconds(live.ctx.currentTime - silenceStartRef.current)
    }
    frameRef.current = audio.frames.request(frameLoop)
  }, [audio.frames])

  const keyDown = async (pc: number): Promise<void> => {
    if (stateRef.current.step > 3 || heldRef.current.has(pc)) return
    const live = await boot()
    if (wipedRef.current) {
      // First note after a reset restores the loop's playback level.
      live.controller.set({ feedback: presetParams('three-notes').feedback })
      wipedRef.current = false
    }
    const osc = live.ctx.createOscillator()
    const gain = live.ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = midiToFreq(midiFor(pc, stateRef.current.step))
    const t = live.ctx.currentTime
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.28, t + 0.06)
    osc.connect(gain)
    gain.connect(live.rig.client.node)
    osc.start()
    heldRef.current.set(pc, { osc, gain })
    setHeldKeys((h) => ({ ...h, [pc]: true }))
    const next = commitNote(stateRef.current, pc)
    setState(next)
    if (next.step === 4) {
      // Lift the record head — the point of the whole exercise.
      live.controller.set({ recordHead: 0 })
      silenceStartRef.current = live.ctx.currentTime
    }
  }

  const keyUp = (pc: number): void => {
    const held = heldRef.current.get(pc)
    if (!held) return
    const live = liveRef.current as Live
    const t = live.ctx.currentTime
    held.gain.gain.setValueAtTime(held.gain.gain.value, t)
    held.gain.gain.linearRampToValueAtTime(0, t + 0.3)
    held.osc.stop(t + 0.4)
    heldRef.current.delete(pc)
    setHeldKeys((h) => ({ ...h, [pc]: false }))
  }

  const reset = (): void => {
    // No erase head exists (the system is additive-only), so the honest wipe
    // is feedback to zero: the loop drains, and the next first note restores
    // the playback level.
    liveRef.current?.controller.set({
      feedback: 0,
      recordHead: presetParams('three-notes').recordHead,
    })
    wipedRef.current = liveRef.current !== null
    silenceStartRef.current = null
    setSilenceSeconds(0)
    setState(initialState())
  }

  React.useEffect(() => {
    frameLoop()
    return () => {
      liveRef.current?.controller.dispose()
      if (frameRef.current !== null) audio.frames.cancel(frameRef.current)
    }
  }, []) // mount-only by design: the loop reads live state through refs

  const suggestions = SUGGESTIONS[state.step] ?? []
  const inSilence = state.step === 4

  return (
    <section aria-label="Three notes and silence" data-instrument="three-notes">
      <ol data-steps>
        {STEP_LABELS.map((label, i) => (
          <li
            key={label}
            data-state={
              state.step === i + 1 ? 'active' : state.step > i + 1 ? 'done' : ''
            }
          >
            {label}
          </li>
        ))}
      </ol>

      <p data-instruction aria-live="polite">
        {instructionFor(state)}
      </p>

      <div role="group" aria-label="One octave of keys" data-keys>
        {Array.from({ length: PITCH_CLASSES }, (_, pc) => {
          const iv = intervalOf(state.root, pc, state.step)
          const lit = state.root !== null && suggestions.includes(iv)
          return (
            <span key={pc} data-key-wrap>
              <button
                type="button"
                data-black={BLACK_KEYS.includes(pc)}
                data-held={heldKeys[pc] === true}
                data-suggest={lit}
                disabled={inSilence}
                aria-label={keyName(pc)}
                onPointerDown={() => void keyDown(pc)}
                onPointerUp={() => keyUp(pc)}
                onPointerLeave={() => keyUp(pc)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault()
                    void keyDown(pc)
                  }
                }}
                onKeyUp={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') keyUp(pc)
                }}
              >
                {keyName(pc)}
              </button>
              <span data-key-tag aria-hidden="true">
                {lit
                  ? shortIntervalName(iv)
                  : state.root !== null && iv === 0 && state.step === 2
                    ? 'root'
                    : ''}
              </span>
            </span>
          )
        })}
      </div>

      <p data-heard>
        <span>What the tape heard</span> {heardReadout(state.played)}
      </p>

      <div data-silence data-on={inSilence}>
        <span data-silence-count>{silenceSeconds.toFixed(1)} s</span>
        <span aria-live="polite" data-silence-say>
          {inSilence ? silenceSay(silenceSeconds) : ''}
        </span>
      </div>

      <button type="button" onClick={reset}>
        Start again
      </button>
    </section>
  )
}
