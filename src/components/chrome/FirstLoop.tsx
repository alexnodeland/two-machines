// The first-loop card (Plan-002 Phase E): sits between the standfirst and
// the Rig on the index, and checks its own steps off as the reader drags,
// sounds, and raises the level. All grading lives in firstLoopSteps.ts (pure,
// module-state); this component renders progress and handles persistence.
//
// SSR-safe by the Rig's own pattern: the server renders the card with every
// step open, the first client render matches it, and localStorage — a done
// or dismissed card never returns — is read in an effect after mount.

import * as React from 'react'
import { Link } from 'gatsby'
import { getArbiterState, subscribeArbiter, type ArbiterState } from '../../audio/arbiter'
import {
  FIRST_LOOP_DISMISSED_KEY,
  FIRST_LOOP_DONE_KEY,
  firstLoopDone,
  getFirstLoopProgress,
  gradeFirstLoop,
  noteRigSounded,
  RIG_VOICE,
} from './firstLoopSteps'

export interface FirstLoopProps {
  /** The Rig's current URL state, live from the page; null until the page
   * has read the real location after mount, so a deep link sets the
   * baseline instead of counting as the reader's move. */
  query: string | null
}

export const FirstLoop: React.FC<FirstLoopProps> = ({ query }) => {
  const [hidden, setHidden] = React.useState(false)
  const [progress, setProgress] = React.useState(getFirstLoopProgress)
  const [announcement, setAnnouncement] = React.useState('')
  const queryRef = React.useRef(query)
  queryRef.current = query

  // A card the reader has finished or waved away never renders again.
  React.useEffect(() => {
    try {
      if (
        window.localStorage.getItem(FIRST_LOOP_DISMISSED_KEY) !== null ||
        window.localStorage.getItem(FIRST_LOOP_DONE_KEY) !== null
      ) {
        setHidden(true)
      }
    } catch {
      // Storage unavailable (private mode): the card simply shows each visit.
    }
  }, [])

  const grade = React.useCallback((q: string): void => {
    const { progress: next, announcement: said } = gradeFirstLoop(q)
    setProgress(next)
    if (said !== null) setAnnouncement(said)
    if (firstLoopDone(next)) {
      try {
        window.localStorage.setItem(FIRST_LOOP_DONE_KEY, 'true')
      } catch {
        // Storage unavailable: completion still holds for this visit.
      }
    }
  }, [])

  // The URL is the evidence for steps 1 and 3 — the same state the Rig writes.
  React.useEffect(() => {
    if (query !== null) grade(query)
  }, [query, grade])

  // The arbiter is the evidence for step 2: the Rig has actually sounded.
  React.useEffect(() => {
    const onState = (state: ArbiterState): void => {
      if (state.sounding === RIG_VOICE) {
        noteRigSounded()
        grade(queryRef.current ?? '')
      }
    }
    onState(getArbiterState())
    return subscribeArbiter(onState)
  }, [grade])

  const dismiss = (): void => {
    setHidden(true)
    try {
      window.localStorage.setItem(FIRST_LOOP_DISMISSED_KEY, 'true')
    } catch {
      // Storage unavailable: dismissal holds for this visit only.
    }
  }

  if (hidden) return null

  const steps: readonly { done: boolean; text: string }[] = [
    {
      done: progress.distance,
      text: 'Set the distance — drag machine two; three to five seconds is where the idiom lives.',
    },
    {
      done: progress.tape,
      text: 'Put something on the tape — hold the pad a couple of seconds.',
    },
    {
      done: progress.feedback,
      text: 'Raise the playback level toward unity and watch the repeats climb.',
    },
  ]
  const payoff = firstLoopDone(progress)

  return (
    <aside data-first-loop aria-label="Your first loop">
      <p data-first-loop-title>Your first loop · about sixty seconds</p>
      <ol data-first-loop-steps>
        {steps.map((step, i) => (
          <li key={step.text} data-step-done={step.done}>
            <span data-step-tick aria-hidden="true">
              {step.done ? '✓' : ''}
            </span>
            <span data-step-tag>
              {step.done ? `step ${i + 1} · done` : `step ${i + 1}`}
            </span>
            <span data-step-text>{step.text}</span>
          </li>
        ))}
        {payoff && (
          <li data-first-loop-payoff>
            <span data-step-tick aria-hidden="true" />
            <span data-step-tag>step 4</span>
            <span data-step-text>
              Now stop playing. What returns is the instrument — the rest of this site is
              consequences. <Link to="/two-cycles/">Begin with two cycles</Link>.
            </span>
          </li>
        )}
      </ol>
      <button type="button" data-first-loop-dismiss onClick={dismiss}>
        I&rsquo;ve got it
      </button>
      <p data-first-loop-announce aria-live="polite">
        {announcement}
      </p>
    </aside>
  )
}
