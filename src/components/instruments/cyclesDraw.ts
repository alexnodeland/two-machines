// Canvas painting for the Cycles engine: thin walkers over the tested
// layouts in src/audio/cycles/views.ts. All geometry decisions live there;
// this file only turns layout records into 2D-context calls, against the
// design tokens' semantic colours (brass = voice one, aqua = voice two,
// voice-three = the sanctioned third accent).

import type {
  DialLayout,
  GridLayout,
  RefusedLayout,
  RibbonLayout,
} from '../../audio/cycles/views'

/** The slice of CanvasRenderingContext2D the painters use — narrow enough
 * to fake exactly in tests. */
export interface Draw2D {
  fillStyle: string | CanvasGradient | CanvasPattern
  strokeStyle: string | CanvasGradient | CanvasPattern
  lineWidth: number
  globalAlpha: number
  font: string
  textAlign: CanvasTextAlign
  textBaseline: CanvasTextBaseline
  clearRect(x: number, y: number, w: number, h: number): void
  fillRect(x: number, y: number, w: number, h: number): void
  strokeRect(x: number, y: number, w: number, h: number): void
  beginPath(): void
  arc(x: number, y: number, r: number, a0: number, a1: number): void
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  fill(): void
  stroke(): void
  fillText(text: string, x: number, y: number): void
}

/** Resolved token colours, injected so the painters stay DOM-free. */
export interface DrawTheme {
  brass: string
  aqua: string
  unison: string
  ivory: string
  ivoryDim: string
  ivoryGhost: string
  voiceThree: string
}

export interface DrawSize {
  width: number
  height: number
}

const voiceColour = (theme: DrawTheme, voice: number): string =>
  voice === 0 ? theme.brass : voice === 1 ? theme.aqua : theme.voiceThree

/** A refused view says why, centred, rather than rendering mush. */
export function drawRefusal(
  ctx: Draw2D,
  size: DrawSize,
  theme: DrawTheme,
  layout: RefusedLayout
): void {
  ctx.clearRect(0, 0, size.width, size.height)
  ctx.fillStyle = theme.ivoryDim
  ctx.font = '13px var(--font-mono)'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(layout.reason, size.width / 2, size.height / 2)
}

/** Grid: voice one fills brass, voice two rings aqua, unison fills unison,
 * a third voice gets a small mark; the current pulse is outlined. */
export function drawGrid(
  ctx: Draw2D,
  size: DrawSize,
  theme: DrawTheme,
  layout: GridLayout
): void {
  ctx.clearRect(0, 0, size.width, size.height)
  const cellW = size.width / layout.cols
  const cellH = size.height / layout.rows
  const pad = Math.min(cellW, cellH) * 0.18

  for (const cell of layout.cells) {
    const x = cell.col * cellW + pad
    const y = cell.row * cellH + pad
    const w = cellW - pad * 2
    const h = cellH - pad * 2

    if (cell.state === 'unison') {
      ctx.fillStyle = theme.unison
      ctx.fillRect(x, y, w, h)
    } else if (cell.state === 'v1') {
      ctx.fillStyle = theme.brass
      ctx.fillRect(x, y, w, h)
    } else if (cell.state === 'v2') {
      ctx.strokeStyle = theme.aqua
      ctx.lineWidth = 1.5
      ctx.strokeRect(x, y, w, h)
    } else {
      ctx.fillStyle = theme.ivoryGhost
      ctx.fillRect(x, y, w, h)
    }

    if (cell.thirdMark) {
      ctx.fillStyle = theme.voiceThree
      ctx.beginPath()
      ctx.arc(x + w / 2, y + h / 2, Math.max(1.5, pad * 0.5), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // The current pulse, outlined.
  ctx.strokeStyle = theme.ivory
  ctx.lineWidth = 2
  ctx.strokeRect(
    layout.currentCol * cellW + pad / 2,
    layout.currentRow * cellH + pad / 2,
    cellW - pad,
    cellH - pad
  )
}

/** Ribbon: one lane per voice, bar lines at cycle boundaries, coincidences
 * as vertical rules, a playhead; a truncation caption when the return is
 * longer than the drawn span. */
export function drawRibbon(
  ctx: Draw2D,
  size: DrawSize,
  theme: DrawTheme,
  layout: RibbonLayout
): void {
  ctx.clearRect(0, 0, size.width, size.height)
  const captionH = layout.truncated ? 18 : 0
  const laneH = (size.height - captionH) / Math.max(layout.lanes.length, 1)
  const pxPerPulse = size.width / layout.span

  // Coincidence rules first, under everything.
  ctx.strokeStyle = theme.unison
  ctx.lineWidth = 1
  for (const rule of layout.rules) {
    const x = rule * pxPerPulse
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, size.height - captionH)
    ctx.stroke()
  }

  layout.lanes.forEach((lane, i) => {
    const top = i * laneH
    ctx.strokeStyle = theme.ivoryGhost
    ctx.lineWidth = 1
    for (const b of lane.boundaries) {
      const x = b * pxPerPulse
      ctx.beginPath()
      ctx.moveTo(x, top + laneH * 0.15)
      ctx.lineTo(x, top + laneH * 0.85)
      ctx.stroke()
    }
    ctx.fillStyle = voiceColour(theme, lane.voice)
    for (const hit of lane.hits) {
      ctx.beginPath()
      ctx.arc(
        hit * pxPerPulse + pxPerPulse / 2,
        top + laneH / 2,
        laneH * 0.18,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
  })

  // Playhead over everything.
  ctx.strokeStyle = theme.ivory
  ctx.lineWidth = 1.5
  const px = layout.playhead * pxPerPulse
  ctx.beginPath()
  ctx.moveTo(px, 0)
  ctx.lineTo(px, size.height - captionH)
  ctx.stroke()

  if (layout.truncated) {
    ctx.fillStyle = theme.ivoryDim
    ctx.font = '11px var(--font-mono)'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'bottom'
    ctx.fillText(
      `first ${layout.span} of ${layout.returnAt} pulses — the full return does not fit`,
      4,
      size.height - 4
    )
  }
}

/** Dials: one per voice, a hand at its phase, rim marks at hit fractions,
 * and expanding rings for recent hits — never a filled disc. */
export function drawDials(
  ctx: Draw2D,
  size: DrawSize,
  theme: DrawTheme,
  layout: DialLayout
): void {
  ctx.clearRect(0, 0, size.width, size.height)
  const n = Math.max(layout.dials.length, 1)
  const slotW = size.width / n
  const radius = Math.min(slotW, size.height) * 0.36
  const cy = size.height / 2

  for (const dial of layout.dials) {
    const cx = dial.voice * slotW + slotW / 2
    const colour = voiceColour(theme, dial.voice)

    ctx.strokeStyle = theme.ivoryGhost
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = colour
    for (const mark of dial.marks) {
      const angle = mark * Math.PI * 2 - Math.PI / 2
      ctx.beginPath()
      ctx.arc(
        cx + Math.cos(angle) * radius,
        cy + Math.sin(angle) * radius,
        3,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }

    const hand = dial.phase * Math.PI * 2 - Math.PI / 2
    ctx.strokeStyle = colour
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(hand) * radius * 0.92, cy + Math.sin(hand) * radius * 0.92)
    ctx.stroke()
  }

  for (const ring of layout.rings) {
    const cx = ring.voice * slotW + slotW / 2
    ctx.strokeStyle = voiceColour(theme, ring.voice)
    ctx.globalAlpha = 1 - ring.age
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, radius * (0.3 + ring.age * 0.8), 0, Math.PI * 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}
