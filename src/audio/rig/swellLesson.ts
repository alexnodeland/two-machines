// The volume-swells lesson (grammar lesson 5, docs/chapters/04-the-grammar.md):
// every attack committed to the loop returns every pass, forever, so the
// exercise is entering notes without one. The diagnostic is measured, not
// narrated: the card watches the rig's output level frame by frame, and the
// steepest rise it sees is the attack that is now on the tape.

/** The attack fader's range, seconds. The floor is a pick; the ceiling is a
 * pedal swell. */
export const ATTACK_MIN = 0.005
export const ATTACK_MAX = 1.5
export const ATTACK_DEFAULT = 0.6

/** Per-frame RMS rise above this is a transient: at ~60 frames a second an
 * 8 ms pick jumps a whole note-level in one frame (~0.3), while a half-second
 * swell climbs ~0.01 per frame. The line between sits comfortably here. */
export const THUMP_RISE = 0.06

export type SwellVerdict = 'waiting' | 'thump' | 'swell'

export const swellVerdict = (
  maxRisePerFrame: number,
  committed: boolean
): SwellVerdict => {
  if (!committed) return 'waiting'
  return maxRisePerFrame >= THUMP_RISE ? 'thump' : 'swell'
}

export const swellSay = (verdict: SwellVerdict): string => {
  if (verdict === 'waiting') {
    return 'Hold the pad and listen to how the note begins. The meter watches the same thing you are hearing: how steeply the sound arrives.'
  }
  if (verdict === 'thump') {
    return 'That attack is committed now. One hard transient is a metronome you did not mean to start — listen for it coming back every pass, then slow the attack and try again.'
  }
  return 'The note arrived already sustaining — as if it had always been there. That is the entry the machine rewards: the loop gains a tone, not a clock.'
}
