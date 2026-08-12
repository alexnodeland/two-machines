// The one AudioContext, ever (ADR-015). Both engines and every instrument
// share it; a second context is a bug, and a guard test asserts this file is
// the only construction site in the tree.
//
// Audio never starts without a user gesture: the context is created lazily on
// first request (which must itself happen inside a gesture handler) and may
// arrive suspended, so callers resume() it as part of the same gesture.

let ctx: AudioContext | null = null

export function getAudioContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext()
  }
  return ctx
}

/** Whether the context has been created yet — lets UI code show state without
 * accidentally creating a context outside a gesture. */
export function hasAudioContext(): boolean {
  return ctx !== null
}
