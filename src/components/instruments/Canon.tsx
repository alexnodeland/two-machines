// The Canon band (chapter 3.1, docs/chapters/03-what-the-tape-does.md): a
// delay line is a perpetual canon at the unison, and phrase length is the one
// free parameter left. Direct descendant of mockups/m-canon.html; all the
// arithmetic lives tested in src/audio/math/canon.ts, the painting in
// canonDraw.ts. The same arithmetic as Part I, expressed in seconds (ADR-016).
//
// M budget (design-system §4): two faders, one visualisation, one verdict.
// The snap buttons are presets on those faders, not extra controls.

import * as React from 'react'
import {
  canonLayout,
  canonVerdict,
  driftPhrase,
  FIGURE,
  FIGURE_ROOT,
} from '../../audio/math/canon'
import { midiToFreq } from '../../audio/math/curves'
import { createRigController, type RigController } from '../../audio/rig/controller'
import type { RigAudio } from '../../audio/rig/node'
import { Fader } from '../controls/Fader'
import { drawCanon } from './canonDraw'
import type { Draw2D } from './cyclesDraw'
import { resolveTheme } from './Cycles'
import type { RigAudioBoot } from './Rig'

const PHRASE_MIN = 0.5
const PHRASE_MAX = 8
const DELAY_MIN = 1.5
const DELAY_MAX = 8
const LOOKAHEAD_SECONDS = 0.15

interface Live {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
}

export const Canon: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const [phrase, setPhrase] = React.useState(3)
  const [delay, setDelay] = React.useState(4)
  const [playing, setPlaying] = React.useState(false)

  const liveRef = React.useRef<Live | null>(null)
  const frameRef = React.useRef<unknown>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const startAtRef = React.useRef(0)
  const nextNoteRef = React.useRef(0)
  const noteIdxRef = React.useRef(0)
  const settingsRef = React.useRef({ phrase, delay, playing })
  settingsRef.current = { phrase, delay, playing }

  const verdict = canonVerdict(phrase, delay)

  const boot = async (): Promise<Live> => {
    if (liveRef.current) return liveRef.current
    const ctx = audio.getContext()
    const rig = await audio.createRig(ctx)
    const controller = createRigController(rig.rigNode, audio.frames, {
      distanceSeconds: settingsRef.current.delay,
      feedback: 0.72,
      recordHead: 0.9,
      monitor: 0.8,
      tapeAge: 0.32,
    })
    controller.syncAll()
    rig.client.node.connect(ctx.destination)
    const live: Live = { ctx, rig, controller }
    liveRef.current = live
    return live
  }

  // One frame of work: schedule any notes inside the lookahead horizon, then
  // repaint. Runs on the injected scheduler only (testing-strategy §6).
  const frameLoop = React.useCallback((): void => {
    const live = liveRef.current
    const { phrase: p, playing: isPlaying } = settingsRef.current
    if (live && isPlaying) {
      const horizon = live.ctx.currentTime + LOOKAHEAD_SECONDS
      const stepDur = p / FIGURE.length
      while (nextNoteRef.current < horizon) {
        const step = noteIdxRef.current % FIGURE.length
        const at = Math.max(live.ctx.currentTime, nextNoteRef.current)
        const osc = live.ctx.createOscillator()
        const gain = live.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = midiToFreq(FIGURE_ROOT + (FIGURE[step] as number))
        const level = step === 0 ? 0.4 : 0.28
        const dur = Math.min(1.4, stepDur * 1.6)
        gain.gain.setValueAtTime(0, at)
        gain.gain.linearRampToValueAtTime(level, at + 0.008)
        gain.gain.linearRampToValueAtTime(0, at + dur)
        osc.connect(gain)
        gain.connect(live.rig.client.node)
        osc.start(at)
        osc.stop(at + dur + 0.05)
        nextNoteRef.current += stepDur
        noteIdxRef.current += 1
      }
    }
    paint()
    frameRef.current = audio.frames.request(frameLoop)
  }, [audio.frames])

  const paint = (): void => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d') as Draw2D | null
    if (!canvas || !ctx) return
    const { phrase: p, delay: d, playing: isPlaying } = settingsRef.current
    const live = liveRef.current
    const playhead = isPlaying && live ? live.ctx.currentTime - startAtRef.current : null
    drawCanon(
      ctx,
      { width: canvas.width, height: canvas.height },
      resolveTheme(canvas),
      canonLayout(p, d),
      playhead !== null && playhead >= 0 ? playhead : null
    )
  }

  const start = async (): Promise<void> => {
    const live = await boot()
    live.controller.set({ distanceSeconds: settingsRef.current.delay, feedback: 0.72 })
    startAtRef.current = live.ctx.currentTime + 0.1
    nextNoteRef.current = startAtRef.current
    noteIdxRef.current = 0
    setPlaying(true)
  }

  const stop = (): void => {
    setPlaying(false)
    // Emptying the tape honestly: kill the feedback path and the loop decays.
    liveRef.current?.controller.set({ feedback: 0 })
  }

  const applyDelay = (value: number): void => {
    setDelay(value)
    liveRef.current?.controller.set({ distanceSeconds: value })
  }

  React.useEffect(() => {
    frameLoop()
    return () => {
      liveRef.current?.controller.dispose()
      if (frameRef.current !== null) audio.frames.cancel(frameRef.current)
    }
  }, []) // mount-only by design: the loop reads live state through refs

  return (
    <section aria-label="The delay is a canon" data-instrument="canon">
      <div data-transport>
        <button type="button" onClick={() => (playing ? stop() : void start())}>
          {playing ? 'Stop' : 'Start the phrase'}
        </button>
        <button type="button" onClick={() => setPhrase(delay)}>
          Make it lock
        </button>
        <button type="button" onClick={() => setPhrase(Math.max(PHRASE_MIN, delay / 2))}>
          Half of T
        </button>
        <button
          type="button"
          onClick={() => setPhrase(driftPhrase(delay, PHRASE_MIN, PHRASE_MAX))}
        >
          Make it drift
        </button>
      </div>

      <canvas
        ref={canvasRef}
        width={640}
        height={320}
        aria-label="The phrase and its returns at T, 2T and 3T"
      />

      <div data-controls>
        <Fader
          label="Phrase length"
          value={phrase}
          min={PHRASE_MIN}
          max={PHRASE_MAX}
          step={0.25}
          format={(v) => `${v.toFixed(2)} s`}
          onChange={setPhrase}
        />
        <Fader
          label="Machine distance"
          value={delay}
          min={DELAY_MIN}
          max={DELAY_MAX}
          step={0.25}
          format={(v) => `${v.toFixed(2)} s`}
          onChange={applyDelay}
        />
      </div>

      <p data-ratio>
        {verdict.ratio.a} : {verdict.ratio.b} — phrase to delay; returns after{' '}
        {verdict.ratio.returnSeconds.toFixed(2)} s
      </p>

      <div data-verdict data-lock={verdict.locked}>
        <b>{verdict.locked ? 'phase-locked · a canon' : 'accumulating'}</b>
        <p>
          {verdict.locked
            ? `Your phrase divides T exactly ${verdict.dividesTimes} time${
                verdict.dividesTimes === 1 ? '' : 's'
              }, so every return lands on a phrase start. The loop becomes ` +
              'self-accompaniment and the harmony stops moving. This is the ordinary ' +
              'sense of canon — and it is the safe, slightly inert setting.'
            : `The phrase and the delay are coprime at ${verdict.ratio.a} : ` +
              `${verdict.ratio.b}, so a return lands somewhere new each time. The ` +
              `pattern only comes back to its start after ${verdict.ratio.returnSeconds.toFixed(
                2
              )} seconds — ${verdict.phrases} phrases and ${verdict.passes} passes ` +
              'of the tape. This is Riley’s accumulator, not a loop.'}
        </p>
      </div>
    </section>
  )
}
