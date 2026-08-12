import { describe, expect, it } from 'vitest'
import {
  advanceRun,
  beginRun,
  formatDuration,
  FORM_HINTS,
  initialRun,
  performableLines,
  PLAN_LINES,
  runVerdict,
} from './sequencePlan'

describe('the plan form', () => {
  it('offers six lines of form hints — verbs, not music', () => {
    expect(FORM_HINTS.length).toBe(PLAN_LINES)
    expect(FORM_HINTS[0]).toMatch(/^Establish/)
    expect(FORM_HINTS[3]).toMatch(/^Wait/)
    for (const hint of FORM_HINTS) {
      expect(hint).not.toMatch(/\b[A-G][♯#b]? (major|minor)\b/)
    }
  })

  it('a plan needs content to perform', () => {
    expect(performableLines(['', '', ''])).toEqual([])
    expect(performableLines(['drone in the low register', '  ', 'wait'])).toEqual([0, 2])
  })
})

describe('the run', () => {
  it('starts in writing, begins at line one with the clock noted', () => {
    expect(initialRun().mode).toBe('writing')
    const run = beginRun(100)
    expect(run).toEqual({
      mode: 'performing',
      current: 0,
      lineStartedAt: 100,
      durations: [],
    })
  })

  it('advancing records the time actually spent on each line', () => {
    let run = beginRun(100)
    run = advanceRun(run, 3, 130)
    expect(run.current).toBe(1)
    expect(run.durations).toEqual([30])
    run = advanceRun(run, 3, 135)
    run = advanceRun(run, 3, 195)
    expect(run.mode).toBe('done')
    expect(run.durations).toEqual([30, 5, 60])
  })

  it('advancing a finished or unstarted run is a no-op', () => {
    const done = advanceRun(advanceRun(beginRun(0), 1, 10), 1, 20)
    expect(done.mode).toBe('done')
    expect(advanceRun(done, 1, 30)).toBe(done)
    expect(advanceRun(initialRun(), 3, 5).mode).toBe('writing')
  })
})

describe('the verdict', () => {
  it('formats durations as minutes and seconds', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(252)).toBe('4:12')
  })

  it('praises a real wait and prods a hurried one', () => {
    expect(runVerdict([30, 5, 60])).toMatch(
      /3 moves in 1:35\. Your longest stay was line 3 at 1:00 — a real wait/
    )
    expect(runVerdict([4, 6, 3])).toMatch(/brief\. Next run, let one line hold you/)
  })
})
