// The tape trace (Rig UI, Plan-001 Phase 3's last presentation item):
// a scrolling record of the loop's peak level, mirrored around a centre
// line — the decay, drawn. Ported from mockups/l-the-rig.html. Past unity
// the trace goes runaway-red, matching the readout and the spine.

import type { Draw2D, DrawSize, DrawTheme } from './cyclesDraw'

/** The trace needs the past-unity colour on top of the shared theme. */
export interface TraceTheme extends DrawTheme {
  runaway: string
}

export const TRACE_STEP_PX = 2

/** How many samples a canvas of this width can hold. */
export const traceCapacity = (width: number): number =>
  Math.max(1, Math.floor(width / TRACE_STEP_PX))

export function drawTrace(
  ctx: Draw2D,
  size: DrawSize,
  theme: TraceTheme,
  peaks: readonly number[],
  runaway: boolean
): void {
  const { width, height } = size
  ctx.clearRect(0, 0, width, height)
  const mid = height / 2

  ctx.strokeStyle = runaway ? theme.runaway : theme.aqua
  ctx.lineWidth = 1
  ctx.globalAlpha = 1
  ctx.beginPath()
  for (let i = 0; i < peaks.length; i++) {
    const x = i * TRACE_STEP_PX
    const a = Math.min(1, peaks[i] as number) * (mid - 2)
    ctx.moveTo(x, mid - a)
    ctx.lineTo(x, mid + a)
  }
  ctx.stroke()

  ctx.strokeStyle = theme.ivoryGhost
  ctx.beginPath()
  ctx.moveTo(0, mid)
  ctx.lineTo(width, mid)
  ctx.stroke()
}
