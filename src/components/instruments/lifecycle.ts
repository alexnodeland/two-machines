// Shared audio-lifecycle timing (ADR-047): every instrument that can be
// silenced — by its own stop button, an arbiter handover, or the kill switch —
// fades and re-arms on the same clock. Defined here rather than imported from
// Rig so instruments never depend on each other; the Rig migrates onto this
// module later.

/** How fast an instrument fades when silenced (arbiter handover, stop, kill).
 * Fast enough to feel like a stop, slow enough never to click. */
export const SILENCE_FADE_SECONDS = 0.06

/** The fade must fully land before the engine state is wiped. */
export const SILENCE_RESET_MS = 120

/** How fast a start gesture re-arms a parked fade stage — short enough to be
 * part of the note's own attack, long enough never to click. */
export const ARM_FADE_SECONDS = 0.02

/** The floor under any tap: a pad or key sounds at least this long. A 40 ms
 * blip into a multi-second loop is inaudible — the client heard it as notes
 * that never played — and a tap released while the engine was still booting
 * used to be swallowed entirely. The minimum is universal: warm or cold,
 * every tap becomes a note (played review, 15 Aug 2026). */
export const MIN_TAP_SECONDS = 0.25

/** The silence contract (refining ADR-047's fade-then-wipe): after silence()
 * the fade stage PARKS at 0 — armed but muted — so a wiped-but-powered tape
 * can never lay its hiss bed under whichever instrument claims the voice
 * next. Every start gesture calls this as its source starts: the stage ramps
 * back to 1 inside the note's own attack. */
export const armFade = (fade: GainNode, now: number): void => {
  fade.gain.cancelScheduledValues(now)
  fade.gain.setValueAtTime(fade.gain.value, now)
  fade.gain.linearRampToValueAtTime(1, now + ARM_FADE_SECONDS)
}
