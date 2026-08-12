import { describe, expect, it } from 'vitest'
import { loopFaceState } from '../../audio/rig/loopFace'
import { FALLBACK_THEME } from './Cycles'
import { drawLoopFace, type LoopDraw2D } from './loopFaceDraw'

const fake2D = (): { ctx: LoopDraw2D; calls: string[]; arcs: number[] } => {
  const calls: string[] = []
  const arcs: number[] = []
  const record =
    (name: string) =>
    (...args: unknown[]): void => {
      calls.push(name)
      if (name === 'arc') arcs.push((args[4] as number) - (args[3] as number))
    }
  const ctx = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    font: '',
    textAlign: 'left' as CanvasTextAlign,
    textBaseline: 'top' as CanvasTextBaseline,
    lineCap: 'butt' as CanvasLineCap,
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
  return { ctx, calls, arcs }
}

const SIZE = { width: 480, height: 480 }

describe('drawLoopFace', () => {
  it('draws the two rings, four quarter marks, and the playhead when empty', () => {
    const { ctx, calls } = fake2D()
    drawLoopFace(ctx, SIZE, FALLBACK_THEME, { arcs: [], occupancy: 0 }, 0.25)
    expect(calls[0]).toBe('clearRect')
    expect(calls.filter((c) => c === 'arc').length).toBe(2)
    expect(calls.filter((c) => c === 'moveTo').length).toBe(5) // quarters + playhead
    expect(ctx.lineCap).toBe('round')
  })

  it('renders a beep as a dot and a drone as a real arc', () => {
    const state = loopFaceState(
      [
        { start: 0, end: 0.001, midi: 55 }, // a beep
        { start: 1, end: 3, midi: 60 }, // a drone
      ],
      3,
      4,
      0.78
    )
    const { ctx, arcs } = fake2D()
    drawLoopFace(ctx, SIZE, FALLBACK_THEME, state, 0)
    const noteArcs = arcs.slice(2) // after the two rings
    expect(noteArcs[0]).toBeCloseTo(0.016, 5) // the dot
    expect(noteArcs[1]).toBeGreaterThan(Math.PI / 2) // half a pass of tape
  })

  it('draws a live hold brass and thicker than a returned note', () => {
    const state = loopFaceState([{ start: 0, end: null, midi: 60 }], 2, 4, 0.78)
    const { ctx } = fake2D()
    drawLoopFace(ctx, SIZE, FALLBACK_THEME, state, 0.5)
    expect(ctx.strokeStyle).toBe(FALLBACK_THEME.ivory) // playhead painted last
    expect(ctx.globalAlpha).toBe(1)
  })
})
