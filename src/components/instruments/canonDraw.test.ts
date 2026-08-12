import { describe, expect, it } from 'vitest'
import { canonLayout } from '../../audio/math/canon'
import { FALLBACK_THEME } from './Cycles'
import { drawCanon } from './canonDraw'
import type { Draw2D } from './cyclesDraw'

const fake2D = (): { ctx: Draw2D; calls: string[]; texts: string[] } => {
  const calls: string[] = []
  const texts: string[] = []
  const record =
    (name: string) =>
    (...args: unknown[]): void => {
      calls.push(name)
      if (name === 'fillText') texts.push(String(args[0]))
    }
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
    clearRect: record('clearRect'),
    fillRect: record('fillRect'),
    strokeRect: record('strokeRect'),
    beginPath: record('beginPath'),
    arc: record('arc'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    fill: record('fill'),
    stroke: record('stroke'),
    fillText: record('fillText'),
  }
  return { ctx, calls, texts }
}

const SIZE = { width: 640, height: 320 }

describe('drawCanon', () => {
  it('clears, labels every generation, and prints the span', () => {
    const { ctx, texts } = fake2D()
    drawCanon(ctx, SIZE, FALLBACK_THEME, canonLayout(3, 4), null)
    expect(texts).toContain('YOU')
    expect(texts).toContain('1T')
    expect(texts).toContain('3T')
    expect(texts.some((t) => /s$/.test(t))).toBe(true)
  })

  it('draws marks for every layout row and dots for coincidences', () => {
    const { ctx, calls } = fake2D()
    const layout = canonLayout(2, 4)
    drawCanon(ctx, SIZE, FALLBACK_THEME, layout, null)
    const marks = layout.rows.reduce((n, r) => n + r.marks.length, 0)
    expect(calls.filter((c) => c === 'fillRect').length).toBe(marks)
    expect(calls.filter((c) => c === 'arc').length).toBe(layout.coincidences.length)
  })

  it('adds a playhead line only when playing', () => {
    const idle = fake2D()
    drawCanon(idle.ctx, SIZE, FALLBACK_THEME, canonLayout(3, 4), null)
    const playing = fake2D()
    drawCanon(playing.ctx, SIZE, FALLBACK_THEME, canonLayout(3, 4), 1.25)
    expect(playing.calls.filter((c) => c === 'stroke').length).toBe(
      idle.calls.filter((c) => c === 'stroke').length + 1
    )
  })
})
