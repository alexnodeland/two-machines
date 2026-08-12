import { describe, expect, it } from 'vitest'
import { dialLayout, gridLayout, ribbonLayout } from '../../audio/cycles/views'
import { getCyclesPreset, type Voice } from '../../audio/cycles/presets'
import {
  type Draw2D,
  drawDials,
  drawGrid,
  drawRefusal,
  drawRibbon,
  type DrawTheme,
} from './cyclesDraw'

class FakeCtx implements Draw2D {
  fillStyle: Draw2D['fillStyle'] = ''
  strokeStyle: Draw2D['strokeStyle'] = ''
  lineWidth = 0
  globalAlpha = 1
  font = ''
  textAlign: CanvasTextAlign = 'left'
  textBaseline: CanvasTextBaseline = 'alphabetic'
  calls: [string, ...unknown[]][] = []
  log(name: string, ...args: unknown[]): void {
    this.calls.push([name, ...args])
  }
  clearRect(...a: number[]): void {
    this.log('clearRect', ...a)
  }
  fillRect(...a: number[]): void {
    this.log('fillRect', this.fillStyle, ...a)
  }
  strokeRect(...a: number[]): void {
    this.log('strokeRect', this.strokeStyle, ...a)
  }
  beginPath(): void {
    this.log('beginPath')
  }
  arc(...a: number[]): void {
    this.log('arc', ...a)
  }
  moveTo(...a: number[]): void {
    this.log('moveTo', ...a)
  }
  lineTo(...a: number[]): void {
    this.log('lineTo', ...a)
  }
  fill(): void {
    this.log('fill', this.fillStyle)
  }
  stroke(): void {
    this.log('stroke', this.strokeStyle)
  }
  fillText(text: string, x: number, y: number): void {
    this.log('fillText', text, x, y)
  }
  count(name: string): number {
    return this.calls.filter((c) => c[0] === name).length
  }
}

const theme: DrawTheme = {
  brass: 'BRASS',
  aqua: 'AQUA',
  unison: 'UNISON',
  ivory: 'IVORY',
  ivoryDim: 'IVORY_DIM',
  ivoryGhost: 'IVORY_GHOST',
  voiceThree: 'VOICE3',
}

const size = { width: 350, height: 245 }

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

describe('drawRefusal', () => {
  it('clears and centres the reason', () => {
    const ctx = new FakeCtx()
    drawRefusal(ctx, size, theme, { kind: 'refused', reason: 'why not' })
    expect(ctx.calls[0]?.[0]).toBe('clearRect')
    expect(ctx.calls).toContainEqual(['fillText', 'why not', 175, 122.5])
  })
})

describe('drawGrid', () => {
  it('paints every cell state with its semantic colour', () => {
    const ctx = new FakeCtx()
    const layout = gridLayout(claps(), 'offset', 0)
    if (layout.kind !== 'grid') throw new Error('grid expected')
    drawGrid(ctx, size, theme, layout)
    const fills = ctx.calls.filter((c) => c[0] === 'fillRect').map((c) => c[1])
    expect(fills).toContain('BRASS')
    expect(fills).toContain('UNISON')
    expect(fills).toContain('IVORY_GHOST')
    const strokes = ctx.calls.filter((c) => c[0] === 'strokeRect').map((c) => c[1])
    expect(strokes).toContain('AQUA') // voice two rings, never fills
    expect(strokes).toContain('IVORY') // the current-pulse outline
  })

  it('marks a third voice with a small dot', () => {
    const ctx = new FakeCtx()
    const layout = gridLayout([voice(4, [0]), voice(2, [0]), voice(3, [0])], 'offset', 0)
    if (layout.kind !== 'grid') throw new Error('grid expected')
    drawGrid(ctx, size, theme, layout)
    expect(ctx.calls.filter((c) => c[0] === 'fill' && c[1] === 'VOICE3')).toHaveLength(2)
  })

  it('clamps the third-voice dot radius on tiny cells', () => {
    const ctx = new FakeCtx()
    const layout = gridLayout([voice(4, [0]), voice(2, [0]), voice(3, [0])], 'offset', 0)
    if (layout.kind !== 'grid') throw new Error('grid expected')
    drawGrid(ctx, { width: 20, height: 20 }, theme, layout)
    const dot = ctx.calls.find((c) => c[0] === 'arc')
    expect(dot?.[3]).toBe(1.5) // the Math.max floor
  })
})

describe('drawRibbon', () => {
  it('draws rules at coincidences, hits per lane, and the playhead', () => {
    const ctx = new FakeCtx()
    drawRibbon(ctx, size, theme, ribbonLayout(claps(), 1))
    expect(ctx.calls.filter((c) => c[0] === 'stroke' && c[1] === 'UNISON')).toHaveLength(
      6
    )
    expect(ctx.count('fill')).toBe(14 + 15) // hits within span 35: 2×7 + 3×5
    expect(ctx.calls.some((c) => c[0] === 'stroke' && c[1] === 'IVORY')).toBe(true)
  })

  it('captions a truncated span instead of silently cutting it', () => {
    const ctx = new FakeCtx()
    const guitars = getCyclesPreset('discipline')?.voices.slice(0, 2) ?? []
    drawRibbon(ctx, size, theme, ribbonLayout(guitars, 0))
    const caption = ctx.calls.find((c) => c[0] === 'fillText')
    expect(String(caption?.[1])).toMatch(/first 120 of 210/)
  })

  it('survives an empty rack', () => {
    const ctx = new FakeCtx()
    expect(() => drawRibbon(ctx, size, theme, ribbonLayout([], 0))).not.toThrow()
  })
})

describe('drawDials', () => {
  it('draws a rim, marks and a hand per voice in its own colour', () => {
    const ctx = new FakeCtx()
    drawDials(
      ctx,
      size,
      theme,
      dialLayout([voice(4, [0, 2]), voice(8, [0]), voice(3, [0])], 1)
    )
    const strokes = ctx.calls.filter((c) => c[0] === 'stroke').map((c) => c[1])
    expect(strokes).toContain('BRASS')
    expect(strokes).toContain('AQUA')
    expect(strokes).toContain('VOICE3')
    expect(ctx.calls.filter((c) => c[0] === 'fill' && c[1] === 'BRASS')).toHaveLength(2) // two rim marks
  })

  it('expands and fades rings by age, restoring alpha afterwards', () => {
    const ctx = new FakeCtx()
    drawDials(
      ctx,
      size,
      theme,
      dialLayout([voice(4, [0])], 0, [{ voice: 0, ageSeconds: 0.2 }])
    )
    expect(ctx.count('arc')).toBeGreaterThan(2) // rim + mark + hand-is-line + ring
    expect(ctx.globalAlpha).toBe(1)
  })

  it('survives an empty rack', () => {
    const ctx = new FakeCtx()
    expect(() => drawDials(ctx, size, theme, dialLayout([], 0))).not.toThrow()
  })
})
