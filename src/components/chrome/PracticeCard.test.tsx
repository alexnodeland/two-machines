// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { getPreset } from '../../audio/rig/presets'
import { practiceSettingsLine } from '../../data/practiceCards'
import { PatchSheet, PracticeCard } from './PracticeCard'

vi.mock('gatsby', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

afterEach(cleanup)

describe('PracticeCard', () => {
  it('renders a lesson card: numbered title, derived settings, move, listen-for, deep link', () => {
    render(<PracticeCard lesson={2} />)
    expect(screen.getByText('Lesson 2 · Beeping and droning')).toBeTruthy()
    const beeping = getPreset('beeping')
    expect(
      screen.getByText(
        practiceSettingsLine((beeping as NonNullable<typeof beeping>).params)
      )
    ).toBeTruthy()
    expect(screen.getByText(/Tap short, separated marks/)).toBeTruthy()
    expect(screen.getByText(/the moment beeping becomes droning/)).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Open the rig with these settings' })
        .getAttribute('href')
    ).toBe('/?preset=beeping')
  })

  it('renders every grammar lesson without a lie in the settings line', () => {
    for (const lesson of [1, 2, 3, 4, 5, 6]) {
      const { unmount } = render(<PracticeCard lesson={lesson} />)
      expect(
        document.querySelector('[data-practice-card-settings]')?.textContent
      ).toMatch(/s of tape \(\d+ cm at 7½ ips\)/)
      unmount()
    }
  })

  it('a title override wins over the lesson lookup, unnumbered', () => {
    render(<PracticeCard lesson={2} title="A different name" />)
    expect(screen.getByText('A different name')).toBeTruthy()
    expect(screen.queryByText(/Lesson 2/)).toBeNull()
  })

  it('renders nothing for a lesson off the curriculum', () => {
    render(<PracticeCard lesson={9} />)
    expect(document.querySelector('[data-practice-card]')).toBeNull()
  })

  it('renders nothing when no preset resolves — a card never prints invented settings', () => {
    render(<PracticeCard title="x" move="y" listenFor="z" />)
    expect(document.querySelector('[data-practice-card]')).toBeNull()
    cleanup()
    render(<PracticeCard lesson={2} presetId="no-such-preset" />)
    expect(document.querySelector('[data-practice-card]')).toBeNull()
  })
})

describe('PatchSheet', () => {
  it('is the authentic preset on the bench: title, wiring move, decay line, deep link', () => {
    render(<PatchSheet />)
    expect(screen.getByText('The Revox-era numbers, on your bench')).toBeTruthy()
    const authentic = getPreset('authentic')
    expect(
      screen.getByText(
        practiceSettingsLine((authentic as NonNullable<typeof authentic>).params)
      )
    ).toBeTruthy()
    expect(screen.getByText(/Thread one reel across both machines/)).toBeTruthy()
    expect(screen.getByText(/decaying, never static/)).toBeTruthy()
    expect(
      screen
        .getByRole('link', { name: 'Open the rig with these settings' })
        .getAttribute('href')
    ).toBe('/?preset=authentic')
  })
})
