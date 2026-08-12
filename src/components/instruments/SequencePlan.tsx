// Writing a structure (grammar lesson 6): the plan comes before the playing.
// The reader writes up to six lines in Lamont's form — the hints carry the
// shape (establish, wait, return), never the notes — then performs the plan
// against the deep-linked rig while this card holds the current line and
// times every move. The verdict is measured: the durations are the honest
// record of whether the drone was actually allowed to fade.
//
// M budget (design-system §4): one mode switch (write/perform), one
// visualisation (the plan with its active line), one verdict (the timed run).
// The card makes no sound of its own — the rig on / is the instrument.

import * as React from 'react'
import {
  advanceRun,
  beginRun,
  formatDuration,
  FORM_HINTS,
  initialRun,
  performableLines,
  PLAN_LINES,
  runVerdict,
  type PlanRun,
} from '../../audio/rig/sequencePlan'
import type { RigAudioBoot } from './Rig'

export const SequencePlan: React.FC<{ audio: RigAudioBoot }> = ({ audio }) => {
  const [lines, setLines] = React.useState<string[]>(() =>
    Array.from({ length: PLAN_LINES }, () => '')
  )
  const [run, setRun] = React.useState<PlanRun>(initialRun)
  const [elapsed, setElapsed] = React.useState(0)

  const liveLines = performableLines(lines)
  const frameRef = React.useRef<unknown>(null)
  const runRef = React.useRef(run)
  runRef.current = run
  const ctxRef = React.useRef<AudioContext | null>(null)

  // The clock is the shared AudioContext — same timebase as the rig the plan
  // is performed against, and injectable in tests.
  const now = (): number => {
    if (ctxRef.current === null) ctxRef.current = audio.getContext()
    return ctxRef.current.currentTime
  }

  const frameLoop = React.useCallback((): void => {
    const r = runRef.current
    if (r.mode === 'performing' && ctxRef.current) {
      setElapsed(ctxRef.current.currentTime - r.lineStartedAt)
    }
    frameRef.current = audio.frames.request(frameLoop)
  }, [audio.frames])

  React.useEffect(() => {
    frameLoop()
    return () => {
      if (frameRef.current !== null) audio.frames.cancel(frameRef.current)
    }
  }, []) // mount-only by design: the loop reads live state through refs

  const setLine = (index: number, text: string): void => {
    setLines((prev) => prev.map((l, i) => (i === index ? text : l)))
  }

  const begin = (): void => {
    setElapsed(0)
    setRun(beginRun(now()))
  }

  const advance = (): void => {
    setElapsed(0)
    setRun(advanceRun(runRef.current, liveLines.length, now()))
  }

  const currentText = (): string => lines[liveLines[run.current] as number] as string

  return (
    <section aria-label="Writing a structure" data-instrument="sequence-plan">
      {run.mode === 'writing' && (
        <>
          <ol data-plan-lines>
            {lines.map((line, i) => (
              <li key={i}>
                <input
                  type="text"
                  value={line}
                  placeholder={FORM_HINTS[i]}
                  aria-label={`Plan line ${i + 1}`}
                  maxLength={80}
                  onChange={(e) => setLine(i, e.target.value)}
                />
              </li>
            ))}
          </ol>
          <button type="button" disabled={liveLines.length < 2} onClick={begin}>
            Perform the plan
          </button>
          {liveLines.length < 2 && (
            <p data-plan-note>Write at least two lines — one line is not a structure.</p>
          )}
        </>
      )}

      {run.mode === 'performing' && (
        <div data-performing>
          <p data-current-line aria-live="polite">
            <b>
              Line {run.current + 1} of {liveLines.length}
            </b>{' '}
            {currentText()}
          </p>
          <p data-line-clock>{formatDuration(elapsed)} on this line</p>
          <button type="button" onClick={advance}>
            {run.current + 1 < liveLines.length ? 'Next line' : 'Finish'}
          </button>
        </div>
      )}

      {run.mode === 'done' && (
        <div data-done>
          <p data-verdict aria-live="polite">
            {runVerdict(run.durations)}
          </p>
          <ol data-run-record>
            {run.durations.map((d, i) => (
              <li key={i}>
                {lines[liveLines[i] as number]} — {formatDuration(d)}
              </li>
            ))}
          </ol>
          <button type="button" onClick={() => setRun(initialRun())}>
            Edit the plan
          </button>
          <button type="button" onClick={begin}>
            Perform it again
          </button>
        </div>
      )}
    </section>
  )
}
