import { describe, expect, it } from 'vitest'
import { FALLBACK_THEME } from './Cycles'
import { drawTrace, TRACE_STEP_PX, traceCapacity, type TraceTheme } from './traceDraw'
import type { Draw2D } from './cyclesDraw'

const THEME: TraceTheme = { ...FALLBACK_THEME, runaway: '#e2564a' }

const fake2D = (): { ctx: Draw2D; strokes: string[]; counts: { moves: number } } => {
  const strokes: string[] = []
  const counts = { moves: 0 }
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
    clearRect: () => {},
    fillRect: () => {},
    strokeRect: () => {},
    beginPath: () => {},
    arc: () => {},
    moveTo: () => {
      counts.moves++
    },
    lineTo: () => {},
    fill: () => {},
    fillText: () => {},
    stroke(): void {
      strokes.push(String(this.strokeStyle))
    },
  }
  return { ctx, strokes, counts }
}

const SIZE = { width: 480, height: 80 }

describe('drawTrace', () => {
  it('draws one mirrored bar per peak in aqua below unity', () => {
    const { ctx, strokes, counts } = fake2D()
    drawTrace(ctx, SIZE, THEME, [0.5, 0.2, 1.4], false)
    expect(strokes[0]).toBe(FALLBACK_THEME.aqua)
    expect(strokes[1]).toBe(FALLBACK_THEME.ivoryGhost) // the centre line, last
    expect(counts.moves).toBe(3 + 1) // one bar per peak + the centre line
  })

  it('goes runaway-red past unity', () => {
    const { ctx, strokes } = fake2D()
    drawTrace(ctx, SIZE, THEME, [0.9], true)
    expect(strokes[0]).toBe('#e2564a')
  })

  it('capacity matches the two-pixel step', () => {
    expect(traceCapacity(480)).toBe(480 / TRACE_STEP_PX)
    expect(traceCapacity(1)).toBe(1)
  })
})
