import { afterEach, describe, expect, it } from 'vitest'
import {
  advanceFirstLoop,
  completionAnnouncement,
  FEEDBACK_DONE_AT,
  firstLoopDone,
  freshFirstLoopProgress,
  getFirstLoopProgress,
  gradeFirstLoop,
  noteRigSounded,
  resetFirstLoopForTests,
  RIG_VOICE,
  type FirstLoopProgress,
} from './firstLoopSteps'

afterEach(resetFirstLoopForTests)

const fresh = freshFirstLoopProgress

describe('advanceFirstLoop', () => {
  it('starts with nothing done', () => {
    expect(advanceFirstLoop(fresh(), 4.2, '', false)).toEqual({
      distance: false,
      tape: false,
      feedback: false,
    })
  })

  it('completes the distance step when the decoded distance leaves the baseline', () => {
    expect(advanceFirstLoop(fresh(), 4.2, 'd=3.5', false).distance).toBe(true)
  })

  it('does not complete distance while the machines stand where they started', () => {
    expect(advanceFirstLoop(fresh(), 3.5, 'd=3.5', false).distance).toBe(false)
  })

  it('distance is sticky: dragging back to the baseline stays done', () => {
    const moved = advanceFirstLoop(fresh(), 4.2, 'd=3.5', false)
    expect(advanceFirstLoop(moved, 4.2, '', false).distance).toBe(true)
  })

  it('completes the tape step only once the rig has sounded', () => {
    expect(advanceFirstLoop(fresh(), 4.2, '', false).tape).toBe(false)
    expect(advanceFirstLoop(fresh(), 4.2, '', true).tape).toBe(true)
  })

  it('tape is sticky after the rig falls silent again', () => {
    const sounded = advanceFirstLoop(fresh(), 4.2, '', true)
    expect(advanceFirstLoop(sounded, 4.2, '', false).tape).toBe(true)
  })

  it(`completes the feedback step at ${FEEDBACK_DONE_AT}, not below`, () => {
    expect(advanceFirstLoop(fresh(), 4.2, 'fb=0.84', false).feedback).toBe(false)
    expect(advanceFirstLoop(fresh(), 4.2, 'fb=0.85', false).feedback).toBe(true)
    expect(advanceFirstLoop(fresh(), 4.2, 'fb=1.06', false).feedback).toBe(true)
  })

  it('feedback is sticky when the fader comes back down', () => {
    const raised = advanceFirstLoop(fresh(), 4.2, 'fb=0.9', false)
    expect(advanceFirstLoop(raised, 4.2, 'fb=0.5', false).feedback).toBe(true)
  })
})

describe('firstLoopDone', () => {
  it('is true only when all three steps are', () => {
    const cases: [FirstLoopProgress, boolean][] = [
      [{ distance: false, tape: false, feedback: false }, false],
      [{ distance: true, tape: false, feedback: false }, false],
      [{ distance: false, tape: true, feedback: false }, false],
      [{ distance: false, tape: false, feedback: true }, false],
      [{ distance: true, tape: true, feedback: false }, false],
      [{ distance: true, tape: false, feedback: true }, false],
      [{ distance: false, tape: true, feedback: true }, false],
      [{ distance: true, tape: true, feedback: true }, true],
    ]
    for (const [progress, expected] of cases) {
      expect(firstLoopDone(progress)).toBe(expected)
    }
  })
})

describe('completionAnnouncement', () => {
  it('is silent when nothing newly completed', () => {
    expect(completionAnnouncement(fresh(), fresh())).toBeNull()
    const done = { distance: true, tape: true, feedback: true }
    expect(completionAnnouncement(done, done)).toBeNull()
  })

  it('names each newly completed step', () => {
    expect(
      completionAnnouncement(fresh(), { distance: true, tape: false, feedback: false })
    ).toBe('Step one done — the distance is set.')
    expect(
      completionAnnouncement(fresh(), { distance: false, tape: true, feedback: false })
    ).toBe('Step two done — something is on the tape.')
    expect(
      completionAnnouncement(fresh(), { distance: false, tape: false, feedback: true })
    ).toBe('Step three done — the playback level is up.')
  })

  it('announces simultaneous completions in step order', () => {
    expect(
      completionAnnouncement(fresh(), { distance: true, tape: false, feedback: true })
    ).toBe(
      'Step one done — the distance is set. Step three done — the playback level is up.'
    )
  })
})

describe('the visit-scoped grader', () => {
  it('fixes the baseline from the first query it sees — a deep link is a starting point', () => {
    const arrival = gradeFirstLoop('preset=mud')
    expect(arrival.progress.distance).toBe(false)
    // mud's 3.0 s is now the baseline; leaving it completes the step.
    expect(gradeFirstLoop('d=4').progress.distance).toBe(true)
  })

  it('a deep-linked feedback at or past the bar counts as raised', () => {
    expect(gradeFirstLoop('fb=0.9').progress.feedback).toBe(true)
  })

  it('accumulates across gradings and reports announcements once each', () => {
    expect(gradeFirstLoop('').announcement).toBeNull()
    const moved = gradeFirstLoop('d=3')
    expect(moved.announcement).toBe('Step one done — the distance is set.')
    expect(gradeFirstLoop('d=3').announcement).toBeNull()
    noteRigSounded()
    expect(gradeFirstLoop('d=3').announcement).toBe(
      'Step two done — something is on the tape.'
    )
    const raised = gradeFirstLoop('d=3&fb=0.85')
    expect(raised.announcement).toBe('Step three done — the playback level is up.')
    expect(firstLoopDone(raised.progress)).toBe(true)
    expect(firstLoopDone(getFirstLoopProgress())).toBe(true)
  })

  it('exposes a copy, not the live state', () => {
    const snapshot = getFirstLoopProgress()
    snapshot.distance = true
    expect(getFirstLoopProgress().distance).toBe(false)
  })

  it('names the voice the Rig registers', () => {
    expect(RIG_VOICE).toBe('The Rig')
  })
})
