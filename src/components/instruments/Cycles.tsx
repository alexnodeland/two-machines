// The Cycles engine — one of the site's exactly two L's (design-system §4).
// N cycles against each other: the thesis in playable form. Carries Part I
// and chapter 8, and absorbs the five-against-seven page as a preset.
//
// Structure: all logic lives in the tested audio layer (transport, kit,
// presets, view layouts, math); this component wires them to the DOM. Audio
// starts only on a user gesture — the AudioContext is created inside the
// play handler, never on render (ADR-015, accessibility §2).

import * as React from 'react'
import { getAudioContext } from '../../audio/context'
import {
  coincidences,
  density,
  longestInterlock,
  returnPulses,
} from '../../audio/math/cycles'
import { createKit, type Kit } from '../../audio/cycles/kit'
import {
  cloneVoices,
  CYCLES_PRESETS,
  type CyclesMode,
  getCyclesPreset,
  type Voice,
} from '../../audio/cycles/presets'
import { createTransport, type Transport } from '../../audio/cycles/transport'
import {
  dialLayout,
  gridLayout,
  ribbonLayout,
  type RingEvent,
  RING_LIFETIME_SECONDS,
} from '../../audio/cycles/views'
import {
  type Draw2D,
  drawDials,
  drawGrid,
  drawRefusal,
  drawRibbon,
  type DrawTheme,
} from './cyclesDraw'

export type CyclesView = 'grid' | 'ribbon' | 'dials'

/** Token hexes as fallbacks so the canvas works even before CSS loads; the
 * live values are read from the computed style when present. */
export const FALLBACK_THEME: DrawTheme = {
  brass: '#E3A83E',
  aqua: '#66D9DE',
  unison: '#FFF6E2',
  ivory: '#F3EEE3',
  ivoryDim: 'rgba(243, 238, 227, 0.6)',
  ivoryGhost: 'rgba(243, 238, 227, 0.12)',
  voiceThree: '#A99BFF',
}

export function resolveTheme(el: Element): DrawTheme {
  const styles = getComputedStyle(el)
  const token = (name: string, fallback: string): string => {
    const value = styles.getPropertyValue(name).trim()
    return value === '' ? fallback : value
  }
  return {
    brass: token('--brass', FALLBACK_THEME.brass),
    aqua: token('--aqua', FALLBACK_THEME.aqua),
    unison: token('--unison', FALLBACK_THEME.unison),
    ivory: token('--ivory', FALLBACK_THEME.ivory),
    ivoryDim: token('--ivory-dim', FALLBACK_THEME.ivoryDim),
    ivoryGhost: token('--ivory-ghost', FALLBACK_THEME.ivoryGhost),
    voiceThree: token('--voice-three', FALLBACK_THEME.voiceThree),
  }
}

/** The audio seams, injectable for tests (testing-strategy §2: assert the
 * calls, never the sound). Defaults construct the real engine lazily. */
export interface CyclesAudioDeps {
  createTransport: typeof createTransport
  createKit: (ctx: BaseAudioContext) => Kit
  getContext: () => AudioContext
  now: () => number
}

export const DEFAULT_AUDIO_DEPS: CyclesAudioDeps = {
  createTransport,
  createKit: (ctx) => createKit(ctx),
  getContext: getAudioContext,
  now: () => getAudioContext().currentTime,
}

export interface CyclesProps {
  /** Initial preset id (default: the clapping exercise). */
  preset?: string
  audio?: CyclesAudioDeps
}

/** Route one frame to the right painter. Exported so every arm — including
 * the grid's refusal — is directly testable. */
export function paintView(
  ctx: Draw2D,
  size: { width: number; height: number },
  theme: DrawTheme,
  view: CyclesView,
  voices: readonly Voice[],
  mode: CyclesMode,
  pulse: number,
  ringEvents: readonly RingEvent[]
): void {
  if (view === 'grid') {
    const layout = gridLayout(voices, mode, pulse)
    if (layout.kind === 'grid') drawGrid(ctx, size, theme, layout)
    else drawRefusal(ctx, size, theme, layout)
  } else if (view === 'ribbon') {
    drawRibbon(ctx, size, theme, ribbonLayout(voices, pulse))
  } else {
    drawDials(ctx, size, theme, dialLayout(voices, pulse, ringEvents))
  }
}

interface EngineRefs {
  transport: Transport
  kit: Kit
}

const describeState = (voices: Voice[], mode: CyclesMode, playing: boolean): string => {
  const cycles = voices.map((v) => v.cycle).join(', ')
  const ret = returnPulses(voices)
  const base = `${voices.length} voices with cycles ${cycles}.`
  if (mode === 'drift') {
    return `${base} Drift mode: different tempos, no exact return, ever. ${
      playing ? 'Playing.' : 'Stopped.'
    }`
  }
  const interlock = longestInterlock(voices, ret)
  return `${base} Offset mode: exact return every ${ret} pulses; the longest stretch with no agreement is ${interlock} pulses. ${
    playing ? 'Playing.' : 'Stopped.'
  }`
}

export const Cycles: React.FC<CyclesProps> = ({ preset = 'claps', audio }) => {
  const deps = audio ?? DEFAULT_AUDIO_DEPS
  const initial =
    getCyclesPreset(preset) ?? (CYCLES_PRESETS[0] as (typeof CYCLES_PRESETS)[number])

  const [presetId, setPresetId] = React.useState<string | null>(initial.id)
  const [mode, setMode] = React.useState<CyclesMode>(initial.mode)
  const [bpm, setBpm] = React.useState(initial.bpm)
  const [unit, setUnit] = React.useState(initial.unit)
  const [voices, setVoices] = React.useState<Voice[]>(() => cloneVoices(initial))
  const [view, setView] = React.useState<CyclesView>(
    initial.mode === 'drift' ? 'dials' : 'grid'
  )
  const [playing, setPlaying] = React.useState(false)

  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const engineRef = React.useRef<EngineRefs | null>(null)
  const ringsRef = React.useRef<{ voice: number; at: number }[]>([])
  const rafRef = React.useRef<number | null>(null)

  const voicesRef = React.useRef(voices)
  voicesRef.current = voices
  const viewRef = React.useRef(view)
  viewRef.current = view
  const modeRef = React.useRef(mode)
  modeRef.current = mode

  // The rack is a research instrument (cycles-engine §8): editing is the
  // point, and editing clears the preset label because it no longer
  // describes what is playing.
  const editVoices = (next: Voice[]): void => {
    setVoices(next)
    setPresetId(null)
    engineRef.current?.transport.setVoices(next)
  }

  const loadPreset = (p: (typeof CYCLES_PRESETS)[number]): void => {
    const next = cloneVoices(p)
    setPresetId(p.id)
    setMode(p.mode)
    setBpm(p.bpm)
    setUnit(p.unit)
    setVoices(next)
    setView(p.mode === 'drift' ? 'dials' : viewRef.current)
    const engine = engineRef.current
    if (engine) {
      engine.transport.setBpm(p.bpm)
      engine.transport.setVoices(next)
    }
  }

  const paint = React.useCallback((): void => {
    const canvas = canvasRef.current
    const engine = engineRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d') as Draw2D | null
    if (!ctx) return

    const size = { width: canvas.width, height: canvas.height }
    const theme = resolveTheme(canvas)
    const pulse = engine ? engine.transport.pulseNow() : 0

    if (engine) {
      const now = deps.now()
      for (const e of engine.transport.drain()) {
        ringsRef.current.push({ voice: e.voice, at: now })
      }
      ringsRef.current = ringsRef.current.filter(
        (r) => now - r.at < RING_LIFETIME_SECONDS
      )
    }

    const now = engine ? deps.now() : 0
    const events: RingEvent[] = ringsRef.current.map((r) => ({
      voice: r.voice,
      ageSeconds: now - r.at,
    }))
    paintView(
      ctx,
      size,
      theme,
      viewRef.current,
      voicesRef.current,
      modeRef.current,
      pulse,
      events
    )
  }, [deps])

  const loop = React.useCallback((): void => {
    paint()
    rafRef.current = requestAnimationFrame(loop)
  }, [paint])

  const stop = React.useCallback((): void => {
    engineRef.current?.transport.stop()
    setPlaying(false)
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    paint()
  }, [paint])

  const start = (): void => {
    // The gesture boundary: the context (and everything hanging off it) is
    // created here, never at render.
    if (!engineRef.current) {
      const ctx = deps.getContext()
      const kit = deps.createKit(ctx)
      const transport = deps.createTransport({
        clock: { now: () => ctx.currentTime },
        timer: {
          set: (fn, ms) => setInterval(fn, ms),
          clear: (h) => clearInterval(h as ReturnType<typeof setInterval>),
        },
        bpm,
        voices: voicesRef.current,
        onFire: (voiceIndex, _beat, time) => {
          if (voiceIndex === null) {
            // the bare pulse under everything: a light tick
            kit.strike(time, { freq: 1500, tone: 0.2, level: 0.15 })
            return
          }
          const v = voicesRef.current[voiceIndex]
          // a stale index (rack edited mid-block) is a safe no-op
          if (v) kit.strike(time, { freq: v.timbre.freq, tone: v.timbre.tone })
        },
      })
      engineRef.current = { transport, kit }
    }
    engineRef.current.transport.setBpm(bpm)
    engineRef.current.transport.setVoices(voicesRef.current)
    engineRef.current.transport.start()
    setPlaying(true)
    loop()
  }

  React.useEffect(() => stop, [stop]) // unmount: stop transport + rAF

  // Idle repaint: the views teach before any gesture — the grid is visible on
  // load and tracks rack, mode and view edits. While playing, the rAF loop
  // owns the canvas.
  React.useEffect(() => {
    if (!playing) paint()
  })

  const onKeyDown = (e: React.KeyboardEvent): void => {
    // Space toggles transport (cycles-engine §8) — but never while typing
    // into a control, where Space is Space.
    if (e.key === ' ' && e.target === e.currentTarget) {
      e.preventDefault()
      if (playing) stop()
      else start()
    }
  }

  const ret = returnPulses(voices)
  const interlock = longestInterlock(voices, ret)
  const coincidenceCount = coincidences(voices, ret).length
  const densityValue = density(voices, ret)

  const setModeAndView = (m: CyclesMode): void => {
    setMode(m)
    setPresetId(null)
    if (m === 'drift' && viewRef.current === 'grid') setView('dials')
  }

  const stepCycle = (index: number, delta: number): void => {
    editVoices(
      voices.map((v, i) =>
        i === index
          ? {
              ...v,
              cycle: Math.min(32, Math.max(1, v.cycle + delta)),
              hits: v.hits.filter((h) => h < Math.min(32, Math.max(1, v.cycle + delta))),
            }
          : v
      )
    )
  }

  const toggleHit = (index: number, beat: number): void => {
    editVoices(
      voices.map((v, i) => {
        if (i !== index) return v
        const hits = v.hits.includes(beat)
          ? v.hits.filter((h) => h !== beat)
          : [...v.hits, beat].sort((a, b) => a - b)
        return { ...v, hits: hits.length ? hits : [0] }
      })
    )
  }

  const toggleMute = (index: number): void => {
    editVoices(voices.map((v, i) => (i === index ? { ...v, muted: !v.muted } : v)))
  }

  return (
    <section
      aria-label="The Cycles engine"
      tabIndex={0}
      onKeyDown={onKeyDown}
      data-instrument="cycles"
    >
      <div role="group" aria-label="Transport">
        <button type="button" onClick={() => (playing ? stop() : start())}>
          {playing ? 'Stop' : 'Play'}
        </button>
        <label>
          Tempo
          <input
            type="range"
            min={40}
            max={520}
            value={bpm}
            aria-label="Tempo"
            onChange={(e) => {
              const b = Number(e.target.value)
              setBpm(b)
              engineRef.current?.transport.setBpm(b)
            }}
          />
          <span data-readout>
            {bpm} {unit}/min
          </span>
        </label>
      </div>

      <div role="group" aria-label="Mode">
        <button
          type="button"
          aria-pressed={mode === 'offset'}
          onClick={() => setModeAndView('offset')}
        >
          Offset
        </button>
        <button
          type="button"
          aria-pressed={mode === 'drift'}
          onClick={() => setModeAndView('drift')}
        >
          Drift
        </button>
      </div>

      <div role="group" aria-label="Presets">
        {CYCLES_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-pressed={presetId === p.id}
            onClick={() => loadPreset(p)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div role="group" aria-label="View">
        {(['grid', 'ribbon', 'dials'] as CyclesView[]).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            disabled={v === 'grid' && mode === 'drift'}
            onClick={() => setView(v)}
          >
            {v}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={720}
        height={280}
        role="img"
        aria-label={`Cycles ${view} view`}
      />

      <div role="group" aria-label="Rack">
        {voices.map((v, i) => (
          <div key={i} role="group" aria-label={v.name}>
            <span>{v.name}</span>
            <button
              type="button"
              aria-label={`${v.name}: shorter cycle`}
              onClick={() => stepCycle(i, -1)}
            >
              −
            </button>
            <span data-readout aria-label={`${v.name}: cycle length`}>
              {v.cycle}
            </span>
            <button
              type="button"
              aria-label={`${v.name}: longer cycle`}
              onClick={() => stepCycle(i, 1)}
            >
              +
            </button>
            <span role="group" aria-label={`${v.name}: hits`}>
              {Array.from({ length: v.cycle }, (_, beat) => (
                <button
                  key={beat}
                  type="button"
                  aria-pressed={v.hits.includes(beat)}
                  aria-label={`${v.name}: beat ${beat + 1}`}
                  onClick={() => toggleHit(i, beat)}
                >
                  {beat + 1}
                </button>
              ))}
            </span>
            <button type="button" aria-pressed={v.muted} onClick={() => toggleMute(i)}>
              Mute
            </button>
          </div>
        ))}
      </div>

      <dl role="group" aria-label="Readouts">
        <dt>Return</dt>
        <dd data-readout>{mode === 'drift' ? 'never' : `${ret} pulses`}</dd>
        <dt>Coincidences per orbit</dt>
        <dd data-readout>{mode === 'drift' ? '—' : coincidenceCount}</dd>
        <dt>Longest interlock</dt>
        <dd data-readout>{mode === 'drift' ? '—' : `${interlock} pulses`}</dd>
        <dt>Density</dt>
        <dd data-readout>{densityValue.toFixed(2)}</dd>
      </dl>

      <p aria-live="polite" data-summary>
        {describeState(voices, mode, playing)}
      </p>
    </section>
  )
}
