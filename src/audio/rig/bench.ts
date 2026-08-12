// Bench geometry for the Rig (ADR-010, ADR-011): delay time IS the physical
// distance between the machines, at a constant px↔cm scale — a ruler that
// stretched as you drag would make the readout a lie (design-system §7).

import {
  clamp,
  distanceToSeconds,
  secondsToDistance,
  type TapeSpeed,
} from '../math/curves'
import { PARAM_RANGES } from './params'

/** The bench's reach: ≈8 s of tape at 7½ ips, matching the prototype. */
export const MAX_CM = 152

export interface BenchScale {
  /** Constant scale for this layout. */
  pxPerCm: number
  /** The shortest allowed gap at this speed, in cm (1.5 s of tape). */
  minCm: number
  /** The longest gap representable on the bench, in cm. */
  maxCm: number
}

/** Fix the scale from the available gap width. Recomputed on resize, never
 * during a drag. */
export function benchScale(maxGapPx: number, speed: TapeSpeed): BenchScale {
  const pxPerCm = maxGapPx / MAX_CM
  return {
    pxPerCm,
    minCm: secondsToDistance(PARAM_RANGES.distanceSeconds.min, speed),
    maxCm: Math.min(MAX_CM, secondsToDistance(PARAM_RANGES.distanceSeconds.max, speed)),
  }
}

/** A dragged gap in pixels → seconds of delay, clamped to the safe range. */
export function gapPxToSeconds(
  gapPx: number,
  scale: BenchScale,
  speed: TapeSpeed
): number {
  const cm = clamp(gapPx / scale.pxPerCm, scale.minCm, scale.maxCm)
  return distanceToSeconds(cm, speed)
}

/** The current delay, as a gap in pixels at this layout's constant scale. */
export function secondsToGapPx(
  seconds: number,
  scale: BenchScale,
  speed: TapeSpeed
): number {
  const cm = clamp(secondsToDistance(seconds, speed), scale.minCm, scale.maxCm)
  return cm * scale.pxPerCm
}

export interface RulerTick {
  cm: number
  px: number
  /** Major ticks are labelled. */
  major: boolean
}

/** Ruler ticks at every 10 cm, majors at 50 — few enough to read, true to
 * the scale. */
export function rulerTicks(scale: BenchScale): RulerTick[] {
  const ticks: RulerTick[] = []
  for (let cm = 0; cm <= scale.maxCm; cm += 10) {
    ticks.push({ cm, px: cm * scale.pxPerCm, major: cm % 50 === 0 })
  }
  return ticks
}
