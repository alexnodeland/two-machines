// The Rig — the Machine half's L (design-system §4): two reel-to-reel decks
// on a bench, delay time as walkable distance. Controls are named after the
// physical thing, never the DSP parameter (Audio engine §3).
//
// All logic lives in the tested layers (params, presets, urlState, bench,
// curves, controller, patch); this component wires them to the DOM. Audio
// boots only inside a gesture — pressing the pad — and until then the rig is
// fully visible and draggable, silently (Part 0's page spec).

import * as React from 'react'
import {
  bytePeakLevel,
  decayTime,
  feedbackState,
  repeatsToInaudible,
  secondsToDistance,
  vuSegments,
} from '../../audio/math/curves'
import {
  benchScale,
  gapPxToSeconds,
  rulerTicks,
  secondsToGapPx,
} from '../../audio/rig/bench'
import {
  createRigController,
  type FrameScheduler,
  type RigController,
} from '../../audio/rig/controller'
import { PARAM_RANGES, type RigParams, TAPE_SPEEDS } from '../../audio/rig/params'
import { RIG_PRESETS } from '../../audio/rig/presets'
import {
  decodeRigState,
  encodeRigState,
  RIG_STATE_STORAGE_KEY,
} from '../../audio/rig/urlState'
import type { RigAudio } from '../../audio/rig/node'
import { setSpineHeat } from '../chrome/spineHeat'
import { FALLBACK_THEME, resolveTheme } from './Cycles'
import { drawTrace, traceCapacity, type TraceTheme } from './traceDraw'
import { useOnScreen } from './useOnScreen'
import type { Draw2D } from './cyclesDraw'
import { Fader } from '../controls/Fader'

/** The bench's fixed logical scale: 608 px of gap = 152 cm, so 4 px/cm. The
 * ruler never stretches (ADR-011); small screens scroll the bench instead
 * (design-system §8, executed in Phase 6). */
export const BENCH_GAP_PX = 608

/** Everything the Rig needs from the audio world, supplied by the page (a
 * coverage-excluded shell) so the component is fully testable: the context
 * arrives lazily, the rig factory wraps createRigAudio with the real worklet
 * factory, frames is requestAnimationFrame. */
export interface RigAudioBoot {
  getContext: () => AudioContext
  createRig: (ctx: AudioContext) => Promise<RigAudio>
  frames: FrameScheduler
}

export interface RigProps {
  /** URL state (the page passes location.search). Validated on read — a
   * hand-edited link can never reach an unsafe state. */
  query?: string
  onQueryChange?: (query: string) => void
  audio: RigAudioBoot
}

interface LiveAudio {
  ctx: AudioContext
  rig: RigAudio
  controller: RigController
  pad: { osc: OscillatorNode; gain: GainNode } | null
  /** Taps for the meters: what goes toward the tape, what the room hears. */
  analyserIn: AnalyserNode
  analyserOut: AnalyserNode
  bytesIn: Uint8Array<ArrayBuffer>
  bytesOut: Uint8Array<ArrayBuffer>
}

export const Rig: React.FC<RigProps> = ({ query = '', onQueryChange, audio }) => {
  // Hydration-safe URL state: the server rendered the defaults (it has no
  // query), so the client's first render must match; the deep link is
  // applied immediately after mount.
  const [params, setParams] = React.useState<RigParams>(() => decodeRigState(''))
  React.useEffect(() => {
    if (query !== '') setParams(decodeRigState(query))
    // The deep link is read once, at arrival.
  }, []) // mount-only by design: the deep link is read once, at arrival
  const [ready, setReady] = React.useState(false)
  const paramsRef = React.useRef(params)
  paramsRef.current = params
  const [padDown, setPadDown] = React.useState(false)

  // Persist the state for read-only reflectors (the chapter-1 XS readout):
  // same codec as the URL, sanitized again on read.
  React.useEffect(() => {
    try {
      window.localStorage.setItem(RIG_STATE_STORAGE_KEY, encodeRigState(params))
    } catch {
      // Storage unavailable (private mode): the readout will show defaults.
    }
  }, [params])

  const [vuIn, setVuIn] = React.useState(0)
  const [vuOut, setVuOut] = React.useState(0)
  const traceRef = React.useRef<HTMLCanvasElement | null>(null)
  const onScreen = useOnScreen(traceRef)
  const peaksRef = React.useRef<number[]>([])
  const frameRef = React.useRef<unknown>(null)

  const liveRef = React.useRef<LiveAudio | null>(null)
  const dragRef = React.useRef<{
    pointerId: number
    startX: number
    startGapPx: number
  } | null>(null)

  const scale = benchScale(BENCH_GAP_PX, params.speed)
  const gapPx = secondsToGapPx(params.distanceSeconds, scale, params.speed)
  const cm = secondsToDistance(params.distanceSeconds, params.speed)

  const apply = (partial: Partial<RigParams>): void => {
    const next = { ...params, ...partial }
    setParams(next)
    liveRef.current?.controller.set(partial)
    onQueryChange?.(encodeRigState(next))
  }

  /** The gesture boundary: everything audio is built here, once. */
  const boot = async (): Promise<LiveAudio> => {
    if (liveRef.current) return liveRef.current
    const ctx = audio.getContext()
    const rig = await audio.createRig(ctx)
    const controller = createRigController(rig.rigNode, audio.frames, params)
    controller.syncAll()
    const analyserIn = ctx.createAnalyser()
    const analyserOut = ctx.createAnalyser()
    analyserIn.fftSize = 512
    analyserOut.fftSize = 512
    rig.client.node.connect(analyserOut)
    rig.client.node.connect(ctx.destination)
    const live: LiveAudio = {
      ctx,
      rig,
      controller,
      pad: null,
      analyserIn,
      analyserOut,
      bytesIn: new Uint8Array(analyserIn.fftSize),
      bytesOut: new Uint8Array(analyserOut.fftSize),
    }
    liveRef.current = live
    setReady(true)
    meterLoop()
    return live
  }

  /** The tone pad — the default instrument (Audio engine §4): click and
   * hold a sustained tone. Never a microphone, never assumed a guitar. */
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
    gain.connect(live.analyserIn)
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

  // The meters (Phase 3's last presentation item): two VUs and the tape
  // trace, running on the injected frame clock once audio is live. Only the
  // painting and readouts live here; the measurement is bytePeakLevel, pure.
  const meterLoop = React.useCallback((): void => {
    const live = liveRef.current
    if (live && onScreen.current) {
      live.analyserIn.getByteTimeDomainData(live.bytesIn)
      live.analyserOut.getByteTimeDomainData(live.bytesOut)
      const input = bytePeakLevel(live.bytesIn)
      const output = bytePeakLevel(live.bytesOut)
      setVuIn(vuSegments(input, 12))
      setVuOut(vuSegments(output, 12))
      const canvas = traceRef.current
      const ctx = canvas?.getContext('2d') as Draw2D | null
      if (canvas && ctx) {
        peaksRef.current.push(output)
        while (peaksRef.current.length > traceCapacity(canvas.width)) {
          peaksRef.current.shift()
        }
        const theme = resolveTheme(canvas)
        const traceTheme: TraceTheme = {
          ...theme,
          runaway:
            getComputedStyle(canvas).getPropertyValue('--runaway').trim() ||
            FALLBACK_THEME.voiceThree,
        }
        drawTrace(
          ctx,
          { width: canvas.width, height: canvas.height },
          traceTheme,
          peaksRef.current,
          paramsRef.current.feedback >= 1
        )
      }
    }
    frameRef.current = audio.frames.request(meterLoop)
  }, [audio.frames])

  // The spine tracks the RUNNING instrument (design-system §5): heat follows
  // the feedback fader once audio is live, and falls to the floor on leave.
  React.useEffect(() => {
    if (ready) setSpineHeat(params.feedback)
  }, [ready, params.feedback])

  React.useEffect(
    () => () => {
      padStop()
      liveRef.current?.controller.dispose()
      setSpineHeat(0)
      if (frameRef.current !== null) audio.frames.cancel(frameRef.current)
    },
    [] // mount-only by design: cleanup closes over refs
  )

  const onDeckPointerDown = (e: React.PointerEvent<HTMLButtonElement>): void => {
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startGapPx: gapPx }
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }

  const onDeckPointerMove = (e: React.PointerEvent): void => {
    const drag = dragRef.current
    if (!drag || e.pointerId !== drag.pointerId) return
    const next = gapPxToSeconds(
      drag.startGapPx + (e.clientX - drag.startX),
      scale,
      params.speed
    )
    apply({ distanceSeconds: next })
  }

  const onDeckPointerUp = (e: React.PointerEvent): void => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null
  }

  const onDeckKeyDown = (e: React.KeyboardEvent): void => {
    // Keyboard is a first-class path (accessibility floor 5): 1 cm per
    // arrow, 10 with Shift, rails on Home/End.
    const stepCm = e.shiftKey ? 10 : 1
    let nextCm: number | null = null
    if (e.key === 'ArrowRight') nextCm = cm + stepCm
    else if (e.key === 'ArrowLeft') nextCm = cm - stepCm
    else if (e.key === 'Home') nextCm = scale.minCm
    else if (e.key === 'End') nextCm = scale.maxCm
    if (nextCm === null) return
    e.preventDefault()
    apply({
      distanceSeconds: gapPxToSeconds(nextCm * scale.pxPerCm, scale, params.speed),
    })
  }

  const repeats = repeatsToInaudible(params.feedback)
  const decay = decayTime(params.feedback, params.distanceSeconds)
  const state = feedbackState(params.feedback)
  const runaway = params.feedback >= 1

  const fmt = (n: number, digits: number): string => n.toFixed(digits)

  return (
    <section aria-label="The Rig" data-instrument="rig">
      {/* The mobile L (design-system §8): the scale never changes; below
          ~600px the viewport becomes a window onto a bench longer than the
          screen. Vertical page scroll always wins; horizontal pan belongs to
          the window; the deck button opts out so dragging a deck moves the
          deck. The readout lives OUTSIDE this window, so it stays visible at
          any scroll position. */}
      <div
        data-bench-window
        style={{ overflowX: 'auto', touchAction: 'pan-x pan-y', maxWidth: '100%' }}
      >
        <div
          data-bench
          style={{ position: 'relative', width: BENCH_GAP_PX + 160, height: 120 }}
        >
          <div data-deck="record" aria-hidden="true" />
          <button
            type="button"
            data-deck="play"
            aria-label="Machine two — drag to set the distance"
            style={{ position: 'absolute', left: 80 + gapPx, touchAction: 'none' }}
            onPointerDown={onDeckPointerDown}
            onPointerMove={onDeckPointerMove}
            onPointerUp={onDeckPointerUp}
            onKeyDown={onDeckKeyDown}
          />
          <div data-ruler aria-hidden="true">
            {rulerTicks(scale).map((tick) => (
              <span
                key={tick.cm}
                data-tick={tick.major ? 'major' : 'minor'}
                style={{ position: 'absolute', left: 80 + tick.px }}
              >
                {tick.major ? `${tick.cm}` : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p data-readout data-runaway={runaway || undefined}>
        {fmt(cm, 1)} cm · {fmt(params.distanceSeconds, 2)} s ·{' '}
        {repeats === Infinity ? '∞ repeats — runaway' : `${fmt(repeats, 0)} repeats`}
        {decay === Infinity ? '' : ` · fades in ${fmt(decay, 1)} s`} · {state}
      </p>

      {ready && (
        <div data-meters>
          {(
            [
              ['record', 'Into the machines', vuIn],
              ['play', 'What the room hears', vuOut],
            ] as const
          ).map(([deck, label, lit]) => (
            <div
              key={deck}
              role="meter"
              aria-label={label}
              aria-valuemin={0}
              aria-valuemax={12}
              aria-valuenow={lit}
              data-vu={deck}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  data-segment={i < lit ? (i >= 10 ? 'hot' : 'lit') : 'dark'}
                  aria-hidden="true"
                >
                  {i < lit ? '█' : '░'}
                </span>
              ))}
            </div>
          ))}
          <div data-trace-wrap>
            <span data-trace-label>What is on the tape — the decay, drawn</span>
            <canvas
              ref={traceRef}
              width={480}
              height={80}
              aria-label="A scrolling trace of the loop level over the last several seconds"
            />
          </div>
        </div>
      )}

      <div role="group" aria-label="Tape speed">
        {TAPE_SPEEDS.map((speed) => (
          <button
            key={speed}
            type="button"
            aria-pressed={params.speed === speed}
            onClick={() => {
              // The machines do not move when the speed switch does: distance
              // is the invariant, time is recomputed (and clamped to the
              // safe range at the new speed).
              const nextScale = benchScale(BENCH_GAP_PX, speed)
              apply({
                speed,
                distanceSeconds: gapPxToSeconds(cm * nextScale.pxPerCm, nextScale, speed),
              })
            }}
          >
            {speed === '3.75' ? '3¾' : speed === '7.5' ? '7½' : '15'} ips
          </button>
        ))}
      </div>

      <div role="group" aria-label="Levels">
        <Fader
          label="Playback level"
          value={params.feedback}
          min={PARAM_RANGES.feedback.min}
          max={PARAM_RANGES.feedback.max}
          unityAt={1}
          onChange={(feedback) => apply({ feedback })}
        />
        <Fader
          label="Record head"
          value={params.recordHead}
          min={PARAM_RANGES.recordHead.min}
          max={PARAM_RANGES.recordHead.max}
          onChange={(recordHead) => apply({ recordHead })}
        />
        <Fader
          label="Monitor"
          value={params.monitor}
          min={PARAM_RANGES.monitor.min}
          max={PARAM_RANGES.monitor.max}
          onChange={(monitor) => apply({ monitor })}
        />
        <Fader
          label="Loop out"
          value={params.loopOut}
          min={PARAM_RANGES.loopOut.min}
          max={PARAM_RANGES.loopOut.max}
          onChange={(loopOut) => apply({ loopOut })}
        />
        <Fader
          label="Tape age"
          value={params.tapeAge}
          min={PARAM_RANGES.tapeAge.min}
          max={PARAM_RANGES.tapeAge.max}
          onChange={(tapeAge) => apply({ tapeAge })}
        />
        <Fader
          label="Master"
          value={params.master}
          min={PARAM_RANGES.master.min}
          max={PARAM_RANGES.master.max}
          onChange={(master) => apply({ master })}
        />
      </div>

      <div role="group" aria-label="Presets">
        {RIG_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => {
              setParams(preset.params)
              liveRef.current?.controller.set(preset.params)
              onQueryChange?.(encodeRigState(preset.params))
            }}
          >
            {preset.id}
          </button>
        ))}
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

      <p aria-live="polite" data-summary>
        {ready
          ? 'Audio running. '
          : 'Silent until you press the pad — audio never starts unasked. '}
        Machine two sits {fmt(cm, 1)} centimetres downstream:{' '}
        {fmt(params.distanceSeconds, 2)} seconds of tape. Playback level{' '}
        {fmt(params.feedback, 2)} — {state}.
      </p>
    </section>
  )
}
