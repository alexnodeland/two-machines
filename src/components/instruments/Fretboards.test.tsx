// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import * as React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Fretboards } from './Fretboards'

afterEach(cleanup)

const setLabel = (): string =>
  document.querySelector('[data-set-label]')?.textContent ?? ''
const verdict = (): string => document.querySelector('[data-verdict]')?.textContent ?? ''

describe('Fretboards', () => {
  it('opens on the bare fifth at the bottom set, both boards rendered', () => {
    render(<Fretboards />)
    expect(
      screen.getByRole('button', { name: 'A bare fifth' }).getAttribute('aria-pressed')
    ).toBe('true')
    expect(setLabel()).toBe('C–G / E–A')
    expect(screen.getByRole('img', { name: /New standard tuning: C · G/ })).toBeTruthy()
    expect(screen.getByRole('img', { name: /Standard tuning: E · B/ })).toBeTruthy()
    expect(screen.getByText('A bare fifth: P5')).toBeTruthy()
  })

  it('dragging to the G–B set shows standard mutating while NST holds', () => {
    render(<Fretboards />)
    const up = screen.getByRole('button', { name: 'Higher strings' })
    fireEvent.click(up)
    fireEvent.click(up)
    expect(verdict()).toMatch(/hold the grip/)
    fireEvent.click(up)
    expect(setLabel()).toBe('A–E / G–B')
    expect(verdict()).toMatch(/Standard tuning just re-fingered/)
  })

  it('the top pair is NST breaking its own pattern — and it says so', () => {
    render(<Fretboards />)
    const up = screen.getByRole('button', { name: 'Higher strings' })
    for (let i = 0; i < 4; i++) fireEvent.click(up)
    expect(setLabel()).toBe('E–G / B–E')
    expect(verdict()).toMatch(/minor-third compromise/)
    expect(up.hasAttribute('disabled')).toBe(true)
  })

  it('the close triad names the stretch, and shape changes reset the set', () => {
    render(<Fretboards />)
    fireEvent.click(screen.getByRole('button', { name: 'Higher strings' }))
    fireEvent.click(screen.getByRole('button', { name: 'A close major triad' }))
    expect(setLabel()).toBe('C–G–D / E–A–D')
    expect(screen.getByText('A close major triad: M3 + m3')).toBeTruthy()
    expect(verdict()).toMatch(/gone wide — the stack fights close thirds/)
  })

  it('the quartal stack is one grip in NST across every fifth-set', () => {
    render(<Fretboards />)
    fireEvent.click(screen.getByRole('button', { name: 'A quartal stack' }))
    const up = screen.getByRole('button', { name: 'Higher strings' })
    fireEvent.click(up)
    expect(verdict()).toMatch(/hold the grip/)
    fireEvent.click(up)
    fireEvent.click(up)
    expect(verdict()).toMatch(/re-finger/)
    const down = screen.getByRole('button', { name: 'Lower strings' })
    for (let i = 0; i < 3; i++) fireEvent.click(down)
    expect(down.hasAttribute('disabled')).toBe(true)
  })

  it('digits appear only inside interval names — never as fret numbers', () => {
    render(<Fretboards />)
    const text = document.querySelector('[data-instrument]')?.textContent ?? ''
    // The mandated vocabulary (P5, m3…) carries digits; nothing else may.
    const withoutIntervals = text.replace(/[PmM][1-8]|TT/g, '')
    expect(withoutIntervals).not.toMatch(/\d/)
  })
})
