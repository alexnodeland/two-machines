// The sequence-plan model (grammar lesson 6, docs/chapters/04-the-grammar.md):
// writing a structure before touching anything. The form is Lamont's — a
// handful of lines, keys and events, nothing more — but the content here is
// the reader's own: the hints scaffold the SHAPE of a plan (establish, wait,
// return), never its notes. Performing the plan is mostly waiting, which is
// why the card times each line: the durations are the honest record of
// whether you actually let the drone fade before moving on.

export const PLAN_LINES = 6

/** Placeholder hints carrying the form, one per line. Verbs, not music. */
export const FORM_HINTS: readonly string[] = [
  'Establish — the drone, the key, the floor of the piece',
  'Sprinkle — a few high events, spaced, committed',
  'Improvise over it — the loop is your accompanist now',
  'Wait — let something fade before the next move',
  'Return — bring back the opening in changed light',
  'Close — very few notes; let the tape finish the piece',
]

export type PlanMode = 'writing' | 'performing' | 'done'

export interface PlanRun {
  mode: PlanMode
  /** Index of the line being performed. */
  current: number
  /** Clock reading when the current line began. */
  lineStartedAt: number
  /** Seconds spent on each completed line. */
  durations: number[]
}

export const initialRun = (): PlanRun => ({
  mode: 'writing',
  current: 0,
  lineStartedAt: 0,
  durations: [],
})

/** A plan is performable when at least two lines have content — one line is
 * not a structure. */
export const performableLines = (lines: readonly string[]): number[] =>
  lines.map((l, i) => (l.trim() === '' ? -1 : i)).filter((i) => i >= 0)

export const beginRun = (now: number): PlanRun => ({
  mode: 'performing',
  current: 0,
  lineStartedAt: now,
  durations: [],
})

/** Advance to the next non-empty line, or finish. */
export const advanceRun = (run: PlanRun, lineCount: number, now: number): PlanRun => {
  if (run.mode !== 'performing') return run
  const durations = [...run.durations, now - run.lineStartedAt]
  const next = run.current + 1
  if (next >= lineCount) {
    return { mode: 'done', current: run.current, lineStartedAt: now, durations }
  }
  return { mode: 'performing', current: next, lineStartedAt: now, durations }
}

export const formatDuration = (seconds: number): string => {
  const whole = Math.max(0, Math.round(seconds))
  const m = Math.floor(whole / 60)
  const s = whole % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** The verdict names the total and the longest wait — patience is the part of
 * the form most worth measuring. */
export const runVerdict = (durations: readonly number[]): string => {
  const total = durations.reduce((a, b) => a + b, 0)
  const longest = Math.max(...durations)
  const at = durations.indexOf(longest) + 1
  return (
    `${durations.length} moves in ${formatDuration(total)}. ` +
    `Your longest stay was line ${at} at ${formatDuration(longest)} — ` +
    (longest >= 20
      ? 'a real wait. The plan held you still, which is what it is for.'
      : 'brief. Next run, let one line hold you longer than feels comfortable.')
  )
}
