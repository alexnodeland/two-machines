// The audio arbiter (ADR-047): one page-load, one voice sounding at a time.
// Pure module state, like the context singleton (ADR-015) — the Web Audio
// side arrives through an injected adapter so this file stays testable and
// the components stay ignorant of the bus wiring.

export interface Voice {
  /** What the sound bar prints while this instrument holds the voice. */
  label: string
  /** Fade to silence fast and stop transports/oscillators. Idempotent. */
  silence(): void
  /** Tear the engine down (worklet dispose). Idempotent. */
  dispose(): void
}

/** What the arbiter needs from the live audio layer (src/audio/live.ts in
 * production; a fake in tests). Attached lazily — audio may never boot. */
export interface ArbiterAudio {
  resume(): void
  suspend(): void
  setBusGain(value: number): void
}

export interface ArbiterState {
  /** The label of the current holder, or null when nothing claims the voice. */
  sounding: string | null
  volume: number
}

type Listener = (state: ArbiterState) => void

/** The kill switch's suspend must trail the silence fade — suspending the
 * context mid-fade freezes the graph with signal still in it. */
export const SUSPEND_AFTER_MS = 150

let adapter: ArbiterAudio | null = null
let holder: Voice | null = null
let volume = 1
let suspendTimer: ReturnType<typeof setTimeout> | null = null
const listeners = new Set<Listener>()

function cancelPendingSuspend(): void {
  if (suspendTimer !== null) {
    clearTimeout(suspendTimer)
    suspendTimer = null
  }
}

function notify(): void {
  const state = getArbiterState()
  for (const fn of listeners) fn(state)
}

export function getArbiterState(): ArbiterState {
  return { sounding: holder ? holder.label : null, volume }
}

export function subscribeArbiter(fn: Listener): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

/** The live layer announces itself once the first engine boots. */
export function attachArbiterAudio(a: ArbiterAudio): void {
  adapter = a
  adapter.setBusGain(volume)
}

/** A start gesture: the caller becomes the one sounding voice. The previous
 * holder is silenced first — switching instruments is a musical act, not an
 * overlap. Also resumes the context (it may arrive suspended, or the kill
 * switch may have suspended it). */
export function claimVoice(voice: Voice): void {
  cancelPendingSuspend()
  if (holder && holder !== voice) holder.silence()
  holder = voice
  adapter?.resume()
  notify()
}

/** A natural stop (a transport's Stop button): the voice lets go without
 * tearing anything down, so the next press is instant. */
export function releaseVoice(voice: Voice): void {
  if (holder !== voice) return
  holder = null
  notify()
}

/** Unmount: silence and tear down, whether or not this voice is the holder —
 * no engine outlives its component (ADR-047 §2). */
export function retireVoice(voice: Voice): void {
  voice.silence()
  voice.dispose()
  if (holder === voice) holder = null
  notify()
}

/** The sound bar's kill switch: silence the holder, tear it down, and stop
 * the clock — a suspended context is the site-wide silence guarantee. */
export function killAllSound(): void {
  if (holder) {
    holder.silence()
    holder.dispose()
    holder = null
  }
  cancelPendingSuspend()
  suspendTimer = setTimeout(() => {
    suspendTimer = null
    adapter?.suspend()
  }, SUSPEND_AFTER_MS)
  notify()
}

export function setMasterVolume(value: number): void {
  volume = value < 0 ? 0 : value > 1 ? 1 : value
  adapter?.setBusGain(volume)
  notify()
}

/** Test seam — module state must not leak between specs. */
export function resetArbiterForTests(): void {
  cancelPendingSuspend()
  adapter = null
  holder = null
  volume = 1
  listeners.clear()
}
