// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import * as React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { DiscreetSchematic } from './DiscreetSchematic'

afterEach(cleanup)

describe('DiscreetSchematic', () => {
  it('is an image with a real text alternative, not a decoration', () => {
    render(<DiscreetSchematic />)
    const img = screen.getByRole('img', { name: /Discreet Music signal path/ })
    // The alternative conveys the RELATIONSHIP (content-methodology §6):
    // the electrical return, and the tape that never does.
    expect(img.querySelector('desc')?.textContent).toMatch(/tape never returns/)
    expect(img.querySelector('desc')?.textContent).toMatch(/delay line/)
  })

  it('carries every load-bearing element of the sleeve diagram', () => {
    render(<DiscreetSchematic />)
    for (const text of [
      'source',
      'equalizer',
      'echo unit',
      'machine one',
      'machine two',
      'the delay line — a span of tape',
      'delay return',
      'output stored on the take-up reel',
      'combined monitor output — the room',
    ]) {
      expect(screen.getByText(text)).toBeTruthy()
    }
  })

  it('colours by machine semantics: record brass, playback aqua (ADR-020)', () => {
    const { container } = render(<DiscreetSchematic />)
    const strokes = Array.from(container.querySelectorAll('rect, path')).map(
      (el) => el.getAttribute('stroke') ?? (el as SVGElement).style.stroke
    )
    expect(strokes).toContain('var(--brass)')
    expect(strokes).toContain('var(--aqua)')
  })

  it('credits the sleeve it descends from', () => {
    render(<DiscreetSchematic />)
    expect(screen.getByText(/Same relationships, our drawing/)).toBeTruthy()
  })
})
