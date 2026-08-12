// Canvas painting for the Canon band: a thin walker over the tested layout in
// src/audio/math/canon.ts, same division of labour as cyclesDraw.ts — all
// geometry decisions live in the layout; this file only turns records into
// 2D-context calls. Brass is what you play, aqua is what returns.

import type { CanonLayout } from '../../audio/math/canon'
import type { Draw2D, DrawSize, DrawTheme } from './cyclesDraw'

const PAD = 16
const TAU = Math.PI * 2

export function drawCanon(
  ctx: Draw2D,
  size: DrawSize,
  theme: DrawTheme,
  layout: CanonLayout,
  /** Seconds since the phrase started, or null when idle. */
  playhead: number | null
): void {
  const { width, height } = size
  ctx.clearRect(0, 0, width, height)
  const x = (t: number): number => PAD + (t / layout.span) * (width - PAD * 2)

  ctx.strokeStyle = theme.brass
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.16
  for (const t of layout.phraseRules) {
    ctx.beginPath()
    ctx.moveTo(x(t), PAD)
    ctx.lineTo(x(t), height - PAD)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  const rowH = (height - PAD * 2) / layout.rows.length
  layout.rows.forEach((row, gen) => {
    const y = PAD + rowH * gen + rowH * 0.55

    ctx.strokeStyle = theme.ivoryGhost
    ctx.beginPath()
    ctx.moveTo(PAD, y)
    ctx.lineTo(width - PAD, y)
    ctx.stroke()

    ctx.fillStyle = theme.ivoryDim
    ctx.font = '9.5px var(--font-mono)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(row.label, PAD, y - rowH * 0.3)

    ctx.globalAlpha = row.alpha
    ctx.fillStyle = gen === 0 ? theme.brass : theme.aqua
    for (const mark of row.marks) {
      const h = (mark.isStart ? 0.34 : 0.2) * rowH
      ctx.fillRect(x(mark.t) - 1.2, y - h, 2.4, h)
    }
    ctx.globalAlpha = 1
  })

  ctx.fillStyle = theme.unison
  for (const t of layout.coincidences) {
    ctx.beginPath()
    ctx.arc(x(t), PAD * 0.7, 3, 0, TAU)
    ctx.fill()
  }

  if (playhead !== null) {
    ctx.strokeStyle = theme.ivory
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x(playhead % layout.span), PAD * 0.4)
    ctx.lineTo(x(playhead % layout.span), height - PAD * 0.4)
    ctx.stroke()
  }

  ctx.fillStyle = theme.ivoryDim
  ctx.font = '9px var(--font-mono)'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`${layout.span.toFixed(1)} s`, width - PAD, height - 3)
}
