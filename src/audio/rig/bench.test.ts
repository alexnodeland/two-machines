import { describe, expect, it } from 'vitest'
import { benchScale, gapPxToSeconds, MAX_CM, rulerTicks, secondsToGapPx } from './bench'

describe('benchScale', () => {
  it('fixes the scale so the full bench is ≈8 s of tape at 7½ ips', () => {
    const scale = benchScale(760, '7.5')
    expect(scale.pxPerCm).toBe(5)
    expect(MAX_CM / 19.05).toBeCloseTo(7.98, 2)
  })

  it('derives the minimum gap from the 1.5 s floor at each speed', () => {
    expect(benchScale(760, '7.5').minCm).toBeCloseTo(28.575, 3) // 1.5 × 19.05
    expect(benchScale(760, '15').minCm).toBeCloseTo(57.15, 3)
    expect(benchScale(760, '3.75').minCm).toBeCloseTo(14.2875, 4)
  })

  it('caps the reach at the bench end or the 8 s rail, whichever bites first', () => {
    expect(benchScale(760, '7.5').maxCm).toBe(152) // 8 s would be 152.4 — bench end wins
    expect(benchScale(760, '3.75').maxCm).toBeCloseTo(76.2, 3) // 8 s of slow tape
  })
})

describe('gapPxToSeconds / secondsToGapPx', () => {
  const scale = benchScale(760, '7.5')

  it('the hero mapping: 80 cm of bench is the 4.2 s default', () => {
    expect(gapPxToSeconds(80 * scale.pxPerCm, scale, '7.5')).toBeCloseTo(4.1995, 3)
  })

  it('round-trips within the safe range', () => {
    for (const s of [1.5, 3.2, 4.2, 6.5]) {
      expect(gapPxToSeconds(secondsToGapPx(s, scale, '7.5'), scale, '7.5')).toBeCloseTo(
        s,
        10
      )
    }
  })

  it('clamps a drag past either rail', () => {
    expect(gapPxToSeconds(0, scale, '7.5')).toBeCloseTo(1.5, 10)
    expect(gapPxToSeconds(10_000, scale, '7.5')).toBeCloseTo(152 / 19.05, 10)
    expect(secondsToGapPx(0.1, scale, '7.5')).toBeCloseTo(scale.minCm * 5, 10)
    expect(secondsToGapPx(99, scale, '7.5')).toBeCloseTo(152 * 5, 10)
  })

  it('the same gap means twice the time at half the speed — distance is real', () => {
    const slow = benchScale(760, '3.75')
    const gap = 60 * scale.pxPerCm // 60 cm
    expect(gapPxToSeconds(gap, slow, '3.75')).toBeCloseTo(
      gapPxToSeconds(gap, scale, '7.5') * 2,
      6
    )
  })
})

describe('rulerTicks', () => {
  it('ticks every 10 cm at the constant scale, majors at 50', () => {
    const scale = benchScale(760, '7.5')
    const ticks = rulerTicks(scale)
    expect(ticks[0]).toEqual({ cm: 0, px: 0, major: true })
    expect(ticks[1]).toEqual({ cm: 10, px: 50, major: false })
    expect(ticks.find((t) => t.cm === 50)?.major).toBe(true)
    expect(ticks[ticks.length - 1]?.cm).toBe(150)
  })

  it('a slower speed shortens the usable ruler', () => {
    const ticks = rulerTicks(benchScale(760, '3.75'))
    expect(ticks[ticks.length - 1]?.cm).toBe(70) // maxCm ≈ 76.2
  })
})
