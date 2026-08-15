// The first loop, guided (Plan-002 Phase E): four steps on the index that
// check themselves off as the reader actually plays them — derived from the
// same URL state the Rig writes and from the arbiter, never from hoping the
// reader followed instructions. Pure logic here; the component only renders.
//
// Progress lives at module level, like the arbiter's: it survives client-side
// navigation within a visit, resets on a fresh page load, and completion or
// dismissal persists across visits via localStorage (read by the component).

import { decodeRigState } from '../../audio/rig/urlState'

export interface FirstLoopProgress {
  /** Step 1 — machine two has been moved from where it stood at arrival. */
  distance: boolean
  /** Step 2 — the arbiter has heard the Rig sound at least once. */
  tape: boolean
  /** Step 3 — the playback level has reached the accumulating range. */
  feedback: boolean
}

/** Step 3's bar: close enough to unity that the repeats audibly climb. */
export const FEEDBACK_DONE_AT = 0.85

/** The label the Rig registers with the arbiter (Rig.tsx's voice). */
export const RIG_VOICE = 'The Rig'

export const FIRST_LOOP_DISMISSED_KEY = 'two-machines:first-loop-dismissed'
export const FIRST_LOOP_DONE_KEY = 'two-machines:first-loop-done'

export const freshFirstLoopProgress = (): FirstLoopProgress => ({
  distance: false,
  tape: false,
  feedback: false,
})

/** One grading pass. Sticky by construction: a done step never un-checks,
 * however far the reader drags back or pulls the fader down. */
export function advanceFirstLoop(
  progress: FirstLoopProgress,
  baselineDistanceSeconds: number,
  query: string,
  rigHasSounded: boolean
): FirstLoopProgress {
  const params = decodeRigState(query)
  return {
    distance: progress.distance || params.distanceSeconds !== baselineDistanceSeconds,
    tape: progress.tape || rigHasSounded,
    feedback: progress.feedback || params.feedback >= FEEDBACK_DONE_AT,
  }
}

export const firstLoopDone = (progress: FirstLoopProgress): boolean =>
  progress.distance && progress.tape && progress.feedback

const STEP_ANNOUNCEMENTS: readonly [keyof FirstLoopProgress, string][] = [
  ['distance', 'Step one done — the distance is set.'],
  ['tape', 'Step two done — something is on the tape.'],
  ['feedback', 'Step three done — the playback level is up.'],
]

/** What the polite live region says when steps newly complete, in step
 * order; null when nothing changed. */
export function completionAnnouncement(
  before: FirstLoopProgress,
  after: FirstLoopProgress
): string | null {
  const said = STEP_ANNOUNCEMENTS.filter(([step]) => !before[step] && after[step]).map(
    ([, text]) => text
  )
  return said.length > 0 ? said.join(' ') : null
}

// ---------------------------------------------------------------- module state

let progress = freshFirstLoopProgress()
let baselineDistance: number | null = null
let rigHasSounded = false

export function getFirstLoopProgress(): FirstLoopProgress {
  return { ...progress }
}

/** The arbiter reported the Rig sounding — step 2's evidence. */
export function noteRigSounded(): void {
  rigHasSounded = true
}

/** Grade the current query against the visit's progress. The first grading
 * fixes the baseline distance, so a deep link's distance is the starting
 * point, never mistaken for the reader's own move. */
export function gradeFirstLoop(query: string): {
  progress: FirstLoopProgress
  announcement: string | null
} {
  if (baselineDistance === null) {
    baselineDistance = decodeRigState(query).distanceSeconds
  }
  const next = advanceFirstLoop(progress, baselineDistance, query, rigHasSounded)
  const announcement = completionAnnouncement(progress, next)
  progress = next
  return { progress: { ...next }, announcement }
}

/** Test seam — module state must not leak between specs. */
export function resetFirstLoopForTests(): void {
  progress = freshFirstLoopProgress()
  baselineDistance = null
  rigHasSounded = false
}
