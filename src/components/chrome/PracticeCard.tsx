// A practice card (Plan-002 Phase E): one grammar lesson as a pocketable
// method — title, the settings the deep link loads (derived from the preset,
// never hand-copied), the move, and the one line to listen for. Printable:
// @media print strips the site chrome and the cards break clean.
//
// The same component, with its lookup overridden, is the bench sheet at the
// end of Building it (<PatchSheet />).

import * as React from 'react'
import { Link } from 'gatsby'
import { getPreset } from '../../audio/rig/presets'
import { practiceCardForLesson, practiceSettingsLine } from '../../data/practiceCards'

export interface PracticeCardProps {
  /** The grammar lesson to look up in PRACTICE_CARDS. */
  lesson?: number
  /** Overrides for a card that is not a grammar lesson (the bench sheet). */
  title?: string
  presetId?: string
  move?: string
  listenFor?: string
}

export const PracticeCard: React.FC<PracticeCardProps> = (props) => {
  const base =
    props.lesson !== undefined ? practiceCardForLesson(props.lesson) : undefined
  const title = props.title ?? base?.title
  const presetId = props.presetId ?? base?.presetId
  const move = props.move ?? base?.move
  const listenFor = props.listenFor ?? base?.listenFor
  const preset = presetId !== undefined ? getPreset(presetId) : undefined
  if (title === undefined || move === undefined || listenFor === undefined || !preset) {
    // A bad lesson number or preset id renders nothing rather than a lie.
    return null
  }
  const heading =
    base !== undefined && props.title === undefined
      ? `Lesson ${base.lesson} · ${title}`
      : title
  return (
    <aside data-practice-card aria-label={heading}>
      <p data-practice-card-title>{heading}</p>
      <p data-practice-card-settings>{practiceSettingsLine(preset.params)}</p>
      <p data-practice-card-move>{move}</p>
      <p data-practice-card-listen>
        <b>Listen for</b> {listenFor}
      </p>
      <p data-practice-card-open>
        <Link to={`/?preset=${preset.id}`}>Open the rig with these settings</Link>
      </p>
    </aside>
  )
}

/** The bench sheet (Building it): the same card carrying the 'authentic'
 * preset — the Revox-era numbers — with the two-machine wiring as the move. */
export const PatchSheet: React.FC = () => (
  <PracticeCard
    presetId="authentic"
    title="The Revox-era numbers, on your bench"
    move={
      'Thread one reel across both machines: machine one records, machine two — ' +
      'a few seconds downstream — plays back, and its output is cabled into ' +
      'machine one’s record input. Machine two’s playback level is your feedback ' +
      'pedal; keep a hand near it.'
    }
    listenFor="a repeat every few seconds, each one duller and quieter — decaying, never static."
  />
)
