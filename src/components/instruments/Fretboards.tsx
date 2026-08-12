// Two fretboards, one shape (chapter 9's M interactive,
// docs/chapters/09-harmony.md). Standard tuning above, NST below; the same
// interval shape landed on both, dragged across string sets. Everything shown
// is pitch classes and interval names — never fret numbers, never a repertoire
// figure (ADR-031).
//
// M budget (design-system §4): one mode switch (the shape row), one control
// (the string-set stepper), one visualisation (the paired boards), one verdict.

import * as React from 'react'
import {
  gripChanged,
  pitchClassName,
  placeShape,
  SHAPES,
  soundingIntervals,
  stringSetCount,
  stringSetLabel,
  TUNINGS,
  type Placement,
  type ShapeKey,
  type Tuning,
} from '../../audio/math/fretboards'

const FRETS = 9
const FRET_W = 46
const STRING_H = 20
const NUT_X = 34
const PAD_Y = 14

const Board: React.FC<{ tuning: Tuning; placement: Placement }> = ({
  tuning,
  placement,
}) => {
  const strings = tuning.midi.length
  const width = NUT_X + FRETS * FRET_W + 10
  const height = PAD_Y * 2 + (strings - 1) * STRING_H
  // Highest string at the top, as a player sees a chord chart.
  const yFor = (stringIndex: number): number =>
    PAD_Y + (strings - 1 - stringIndex) * STRING_H
  const notes = placement.midi.map(pitchClassName).join(' · ')
  return (
    <figure data-board={tuning.name}>
      <figcaption>{tuning.name}</figcaption>
      <svg
        role="img"
        aria-label={`${tuning.name}: ${notes} on the ${stringSetLabel(tuning, placement)} strings`}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: 'block', maxWidth: '100%' }}
      >
        {tuning.midi.map((open, i) => (
          <g key={i}>
            <text x={4} y={yFor(i) + 4} fontSize={11}>
              {pitchClassName(open)}
            </text>
            <line
              x1={NUT_X}
              y1={yFor(i)}
              x2={NUT_X + FRETS * FRET_W}
              y2={yFor(i)}
              stroke="currentColor"
              strokeWidth={1}
            />
          </g>
        ))}
        {Array.from({ length: FRETS + 1 }, (_, f) => (
          <line
            key={f}
            x1={NUT_X + f * FRET_W}
            y1={PAD_Y}
            x2={NUT_X + f * FRET_W}
            y2={height - PAD_Y}
            stroke="currentColor"
            strokeWidth={f === 0 ? 3 : 1}
            opacity={f === 0 ? 1 : 0.35}
          />
        ))}
        {placement.frets.map((fret, i) => {
          const stringIndex = placement.startString + i
          const cx = fret === 0 ? NUT_X : NUT_X + fret * FRET_W - FRET_W / 2
          return (
            <g key={i}>
              <circle cx={cx} cy={yFor(stringIndex)} r={9} fill="currentColor" />
              <text
                x={cx}
                y={yFor(stringIndex) + 3.5}
                fontSize={9}
                textAnchor="middle"
                fill="var(--paper, #fff)"
              >
                {pitchClassName(placement.midi[i] as number)}
              </text>
            </g>
          )
        })}
      </svg>
    </figure>
  )
}

export const Fretboards: React.FC = () => {
  const [shapeKey, setShapeKey] = React.useState<ShapeKey>('fifths-dyad')
  const [set, setSet] = React.useState(0)

  const shape = SHAPES[shapeKey]
  const sets = stringSetCount(TUNINGS.nst, shape)
  const std = placeShape(TUNINGS.standard, shape, set)
  const nst = placeShape(TUNINGS.nst, shape, set)

  const pick = (key: ShapeKey): void => {
    setShapeKey(key)
    setSet(0)
  }

  const changedStd = gripChanged(TUNINGS.standard, shape, std.startString)
  const changedNst = gripChanged(TUNINGS.nst, shape, nst.startString)
  const stretch =
    nst.span >= std.span + 2
      ? ' And the NST grip has gone wide — the stack fights close thirds.'
      : ''
  const verdict =
    (!changedStd && !changedNst
      ? 'Both tunings hold the grip from the bottom set. Keep dragging.'
      : changedStd && !changedNst
        ? 'Standard tuning just re-fingered the shape; the NST grip has not moved. That is what a regular tuning buys.'
        : !changedStd && changedNst
          ? 'NST re-fingered here — the top pair is the minor-third compromise, its one break in the pattern.'
          : 'Both tunings re-finger on this set: each has hit its own irregular pair.') +
    stretch

  return (
    <section aria-label="Two tunings, one shape" data-instrument="fretboards">
      <div role="group" aria-label="Interval shape">
        {(Object.keys(SHAPES) as ShapeKey[]).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={key === shapeKey}
            onClick={() => pick(key)}
          >
            {SHAPES[key].name}
          </button>
        ))}
      </div>

      <div role="group" aria-label="String set">
        <button
          type="button"
          disabled={set === 0}
          onClick={() => setSet((s) => Math.max(0, s - 1))}
        >
          Lower strings
        </button>
        <span aria-live="polite" data-set-label>
          {stringSetLabel(TUNINGS.nst, nst)} / {stringSetLabel(TUNINGS.standard, std)}
        </span>
        <button
          type="button"
          disabled={set >= sets - 1}
          onClick={() => setSet((s) => Math.min(sets - 1, s + 1))}
        >
          Higher strings
        </button>
      </div>

      <Board tuning={TUNINGS.standard} placement={std} />
      <Board tuning={TUNINGS.nst} placement={nst} />

      <p data-intervals>
        {shape.name}: {soundingIntervals(shape).join(' + ')}
      </p>
      <p aria-live="polite" data-verdict>
        {verdict}
      </p>
    </section>
  )
}
