// The practice cards (Plan-002 Phase E): the grammar's six lessons as a
// printable method — one card per lesson, at the end of its section. Only
// the words live here; every printed setting is derived at render from
// RIG_PRESETS (the same rows the deep links load), so a card can never
// drift from the rig it opens.

import { secondsToDistance } from '../audio/math/curves'
import type { RigParams } from '../audio/rig/params'

export interface PracticeCardEntry {
  lesson: number
  title: string
  /** The RIG_PRESETS row the card's settings are derived from. */
  presetId: string
  /** The physical instruction — what your hands do. */
  move: string
  /** The debrief, distilled to one line; completes "Listen for …". */
  listenFor: string
}

/** One per grammar lesson, in lesson order. The move and listen-for lines
 * compress each lesson's prose — same voice, shorter breath. */
export const PRACTICE_CARDS: readonly PracticeCardEntry[] = [
  {
    lesson: 1,
    title: 'Three notes and silence',
    presetId: 'three-notes',
    move:
      'Seed the loop with exactly three tones — the root, then a fifth or a third, ' +
      'then something less obvious — and stop. Sit with what returns until it ' +
      'suggests the next move, and only then play it.',
    listenFor:
      'your first note becoming the key — everything you add is measured against it.',
  },
  {
    lesson: 2,
    title: 'Beeping and droning',
    presetId: 'beeping',
    move:
      'Tap short, separated marks, then hold one tone until it fuses into the loop. ' +
      'Trade deliberately between the two textures.',
    listenFor:
      'the moment beeping becomes droning — your note length against the loop, ' +
      'not the notes themselves.',
  },
  {
    lesson: 3,
    title: 'Not committing',
    presetId: 'not-committing',
    move:
      'Take the record head to zero and keep playing: the room hears you, the tape ' +
      'ignores you. When a phrase earns its place, raise the head and commit it.',
    listenFor:
      'nothing accumulating until you choose it — committing as a decision, ' +
      'never a side effect.',
  },
  {
    lesson: 4,
    title: 'Avoiding mud',
    presetId: 'mud',
    move:
      'Fill the loop past what it can carry — fast, thick, one octave. Then pull ' +
      'the playback level down, thin your playing, and spread out of the middle ' +
      'register.',
    listenFor:
      'the loop clearing itself over the next few passes — thinner, and out of ' +
      'the middle: the boundary of mud runs through how much and where.',
  },
  {
    lesson: 5,
    title: 'Volume swells and soft attack',
    presetId: 'swells',
    move:
      'Enter every note without an attack: swell in from silence so the tone ' +
      'arrives already sustaining. One hard transient is a metronome you did not ' +
      'mean to start.',
    listenFor: 'an arrival that is a tone, not an event — nothing ticking like a clock.',
  },
  {
    lesson: 6,
    title: 'Writing a structure',
    presetId: 'sequence-plan',
    move:
      'Write a five- or six-line plan first — keys and events, nothing more — then ' +
      'perform it against the rig. Most of performing a structure is waiting; let ' +
      'it be.',
    listenFor:
      'whether you actually let the drone fade before the change — the plan kept, ' +
      'or honestly argued with.',
  },
]

export function practiceCardForLesson(lesson: number): PracticeCardEntry | undefined {
  return PRACTICE_CARDS.find((card) => card.lesson === lesson)
}

/** Print a level the way the URL codec does: two decimals, no float noise. */
const level = (n: number): string => String(Number(n.toFixed(2)))

const SPEED_LABELS = { '3.75': '3¾', '7.5': '7½', '15': '15' } as const

/** The settings line, derived from a preset's params — distance in seconds
 * and in centimetres of tape via the same pure math the bench uses. */
export function practiceSettingsLine(params: RigParams): string {
  const cm = Math.round(secondsToDistance(params.distanceSeconds, params.speed))
  return (
    `${params.distanceSeconds.toFixed(1)} s of tape ` +
    `(${cm} cm at ${SPEED_LABELS[params.speed]} ips) · ` +
    `playback ${level(params.feedback)} · ` +
    `record head ${level(params.recordHead)} · ` +
    `monitor ${level(params.monitor)} · ` +
    `tape age ${level(params.tapeAge)}`
  )
}
