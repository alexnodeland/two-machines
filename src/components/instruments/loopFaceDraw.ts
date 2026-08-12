// Canvas painting for the loop face: a thin walker over the arcs computed in
// src/audio/rig/loopFace.ts. One revolution is one pass of the tape; brass is
// what you are playing now, aqua is what the tape is carrying.

import type { LoopFaceState } from '../../audio/rig/loopFace'
import type { Draw2D, DrawSize, DrawTheme } from './cyclesDraw'

/** The face needs round line caps on its arcs; everything else is Draw2D. */
export interface LoopDraw2D extends Draw2D {
  lineCap: CanvasLineCap
}

const TAU = Math.PI * 2
const TOP = -Math.PI / 2

export function drawLoopFace(
  ctx: LoopDraw2D,
  size: DrawSize,
  theme: DrawTheme,
  state: LoopFaceState,
  /** Playhead position as a fraction of the revolution. */
  playheadFrac: number
): void {
  const { width, height } = size
  ctx.clearRect(0, 0, width, height)
  const cx = width / 2
  const cy = height / 2
  const outer = Math.min(width, height) * 0.46
  const inner = Math.min(width, height) * 0.2

  // The ring itself, plus quarter marks so the period is readable.
  ctx.strokeStyle = theme.ivoryGhost
  ctx.lineWidth = 1
  ctx.globalAlpha = 1
  for (const r of [inner, outer]) {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, TAU)
    ctx.stroke()
  }
  for (let q = 0; q < 4; q++) {
    const a = TOP + (q / 4) * TAU
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer)
    ctx.stroke()
  }

  ctx.lineCap = 'round'
  for (const arc of state.arcs) {
    const a0 = TOP + arc.startFrac * TAU
    const a1 = a0 + arc.lengthFrac * TAU
    const r = inner + arc.radiusFrac * (outer - inner)
    ctx.strokeStyle = arc.live ? theme.brass : theme.aqua
    ctx.globalAlpha = arc.amp
    ctx.lineWidth = arc.live ? 4 : 3
    ctx.beginPath()
    if (a1 - a0 < 0.012) {
      // A beep — a dot, not a zero-length arc.
      ctx.arc(cx, cy, r, a0 - 0.008, a0 + 0.008)
    } else {
      ctx.arc(cx, cy, r, a0, a1)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const pa = TOP + playheadFrac * TAU
  ctx.strokeStyle = theme.ivory
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx + Math.cos(pa) * (inner - 6), cy + Math.sin(pa) * (inner - 6))
  ctx.lineTo(cx + Math.cos(pa) * (outer + 6), cy + Math.sin(pa) * (outer + 6))
  ctx.stroke()
}
