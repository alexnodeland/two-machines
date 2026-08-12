import { describe, expect, it } from 'vitest'
import { getCyclesPreset, type Voice } from './presets'
import {
  dialLayout,
  GRID_MAX_CELLS,
  gridLayout,
  RIBBON_MAX_SPAN,
  ribbonLayout,
  RING_LIFETIME_SECONDS,
} from './views'

const voice = (cycle: number, hits: number[], rate = 1): Voice => ({
  name: `v${cycle}`,
  cycle,
  hits,
  rate,
  timbre: { freq: 900, tone: 0.5 },
  muted: false,
  colour: 'brass',
})

const claps = () => getCyclesPreset('claps')?.voices ?? []

describe('gridLayout', () => {
  it('lays five against seven as 5 columns × 7 rows', () => {
    const layout = gridLayout(claps(), 'offset', 0)
    if (layout.kind !== 'grid') throw new Error('expected a grid')
    expect(layout.cols).toBe(5)
    expect(layout.rows).toBe(7)
    expect(layout.cells).toHaveLength(35)
  })

  it('marks unison cells exactly at the coincidences', () => {
    const layout = gridLayout(claps(), 'offset', 0)
    if (layout.kind !== 'grid') throw new Error('expected a grid')
    const unison = layout.cells.filter((c) => c.state === 'unison').map((c) => c.pulse)
    expect(unison).toEqual([0, 3, 5, 10, 28, 33]) // the six realignments
    // and non-coinciding hits carry their own machine's state
    const v1Only = layout.cells.find((c) => c.pulse === 8)
    expect(v1Only?.state).toBe('v1') // 8 % 5 = 3 hits; 8 % 7 = 1 does not
  })

  it('gives a third voice a small mark without competing for cell state', () => {
    const discipline = getCyclesPreset('discipline')?.voices ?? []
    // guitars-only span keeps it under the cell cap: drop the drums for state,
    // then re-add to check the mark
    const layout = gridLayout(discipline.slice(0, 2), 'offset', 0)
    if (layout.kind !== 'grid') throw new Error('expected a grid')
    expect(layout.cols).toBe(15)
    expect(layout.rows).toBe(14)

    const withThird = gridLayout(
      [voice(4, [0]), voice(2, [0]), voice(3, [0])],
      'offset',
      0
    )
    if (withThird.kind !== 'grid') throw new Error('expected a grid')
    const marked = withThird.cells.filter((c) => c.thirdMark).map((c) => c.pulse)
    expect(marked).toEqual([0, 3]) // pulses divisible by 3 within lcm(4,2)=4? no: 0..3 → 0,3
  })

  it('folds the current pulse into the orbit, outlining one cell', () => {
    const layout = gridLayout(claps(), 'offset', 37) // 37 ≡ 2 (mod 35)
    if (layout.kind !== 'grid') throw new Error('expected a grid')
    expect(layout.currentCol).toBe(2)
    expect(layout.currentRow).toBe(0)
  })

  it('is disabled in drift — there is nothing to come home to (ADR-016)', () => {
    const layout = gridLayout(claps(), 'drift', 0)
    expect(layout.kind).toBe('refused')
    if (layout.kind === 'refused') expect(layout.reason).toMatch(/drift/i)
  })

  it('refuses above the cell cap and says why, rather than rendering mush', () => {
    // 31 × 32 = 992 cells: large but drawable
    expect(gridLayout([voice(31, [0]), voice(32, [0])], 'offset', 0).kind).toBe('grid')
    // 25 × 49 = 1225 cells: over the 1200 cap → refuse with a reason
    const tooBig = gridLayout([voice(25, [0]), voice(49, [0])], 'offset', 0)
    expect(tooBig.kind).toBe('refused')
    if (tooBig.kind === 'refused') expect(tooBig.reason).toMatch(/too long/i)
    expect(GRID_MAX_CELLS).toBe(1200)
  })

  it('refuses with fewer than two voices', () => {
    expect(gridLayout([voice(5, [0])], 'offset', 0).kind).toBe('refused')
    expect(gridLayout([], 'offset', 0).kind).toBe('refused')
  })

  it('every spec preset fits the grid: 5×7, 15×14, 7×6, 7×8, 15×8', () => {
    const pairs: [number, number][] = [
      [5, 7],
      [15, 14],
      [7, 6],
      [7, 8],
      [15, 8],
    ]
    for (const [a, b] of pairs) {
      expect(gridLayout([voice(a, [0]), voice(b, [0])], 'offset', 0).kind).toBe('grid')
    }
  })
})

describe('ribbonLayout', () => {
  it('draws the full orbit when it fits', () => {
    const layout = ribbonLayout(claps(), 0)
    expect(layout.span).toBe(35)
    expect(layout.truncated).toBe(false)
    expect(layout.rules).toEqual([0, 3, 5, 10, 28, 33])
  })

  it('caps the span at 120 and says so rather than silently truncating', () => {
    const guitars = getCyclesPreset('discipline')?.voices.slice(0, 2) ?? []
    const layout = ribbonLayout(guitars, 0) // return 210
    expect(layout.span).toBe(RIBBON_MAX_SPAN)
    expect(layout.returnAt).toBe(210)
    expect(layout.truncated).toBe(true)
  })

  it('lays one lane per voice with hits and cycle boundaries', () => {
    const layout = ribbonLayout([voice(4, [0, 2]), voice(3, [0])], 0) // span 12
    expect(layout.lanes).toHaveLength(2)
    expect(layout.lanes[0]?.hits).toEqual([0, 2, 4, 6, 8, 10])
    expect(layout.lanes[0]?.boundaries).toEqual([0, 4, 8, 12])
    expect(layout.lanes[1]?.boundaries).toEqual([0, 3, 6, 9, 12])
  })

  it('folds the playhead into the drawn span', () => {
    expect(ribbonLayout(claps(), 36).playhead).toBe(1)
  })

  it('handles no voices without dividing by zero', () => {
    const layout = ribbonLayout([], 10)
    expect(layout.span).toBe(1)
    expect(layout.playhead).toBe(0)
    expect(layout.lanes).toEqual([])
  })
})

describe('dialLayout', () => {
  it('turns each dial once per its own cycle', () => {
    const layout = dialLayout([voice(4, [0]), voice(8, [0])], 2)
    expect(layout.dials[0]?.phase).toBe(0.5) // 2 of 4
    expect(layout.dials[1]?.phase).toBe(0.25) // 2 of 8
  })

  it('rate separates the hands — this is drift made visible', () => {
    const layout = dialLayout([voice(8, [0], 1), voice(8, [0], 1.04)], 8)
    expect(layout.dials[0]?.phase).toBe(0)
    expect(layout.dials[1]?.phase).toBeCloseTo(0.04, 10)
  })

  it('places rim marks at the hit fractions', () => {
    const layout = dialLayout([voice(4, [0, 3])], 0)
    expect(layout.dials[0]?.marks).toEqual([0, 0.75])
  })

  it('hit feedback is an expanding ring with a finite lifetime, never a disc', () => {
    const layout = dialLayout([voice(4, [0])], 0, [
      { voice: 0, ageSeconds: 0 },
      { voice: 0, ageSeconds: RING_LIFETIME_SECONDS / 2 },
      { voice: 0, ageSeconds: RING_LIFETIME_SECONDS }, // dead
      { voice: 0, ageSeconds: -0.01 }, // not yet heard
    ])
    expect(layout.rings.map((r) => r.age)).toEqual([0, 0.5])
  })

  it('a zero rate falls back to 1 rather than freezing the dial', () => {
    const layout = dialLayout([voice(4, [0], 0)], 1)
    expect(layout.dials[0]?.phase).toBe(0.25)
  })
})
