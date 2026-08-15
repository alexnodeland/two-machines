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
