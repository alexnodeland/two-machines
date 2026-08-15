// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'

vi.mock('gatsby', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

import { currentSection, SiteHeader } from './SiteHeader'
import { ChapterPager } from './ChapterPager'
import {
  nextStop,
  positionInPart,
  previousStop,
  READING_ORDER,
  stopIndex,
} from '../../data/readingOrder'

afterEach(cleanup)

describe('the reading order', () => {
  it('starts at the thesis and ends at Listen', () => {
    expect(READING_ORDER[0]?.slug).toBe('/two-cycles/')
    expect(READING_ORDER[READING_ORDER.length - 1]?.slug).toBe('/listen/')
  })

  it('walks forward and back, with closed ends', () => {
    expect(previousStop('/two-cycles/')).toBeNull()
    expect(nextStop('/listen/')).toBeNull()
    expect(nextStop('/machine/what-it-is/')?.slug).toBe('/machine/where-it-came-from/')
    expect(previousStop('/machine/what-it-is/')?.slug).toBe('/two-cycles/')
    expect(stopIndex('/not-a-chapter/')).toBe(-1)
    expect(nextStop('/not-a-chapter/')).toBeNull()
  })
})

describe('SiteHeader', () => {
  it('offers the wordmark home and the hand-rail links', () => {
    render(<SiteHeader />)
    expect(screen.getByRole('link', { name: 'Two Machines' }).getAttribute('href')).toBe(
      '/'
    )
    for (const name of ['Begin', 'The Machine', 'The Discipline', 'Listen', 'Sources']) {
      expect(screen.getByRole('link', { name })).toBeTruthy()
    }
  })
})

describe('ChapterPager', () => {
  it('shows both directions mid-order, with rel hints', () => {
    render(<ChapterPager slug="/machine/what-it-is/" />)
    const prev = screen.getByRole('link', { name: /Two cycles/ })
    const next = screen.getByRole('link', { name: /Where it came from/ })
    expect(prev.getAttribute('rel')).toBe('prev')
    expect(next.getAttribute('rel')).toBe('next')
  })

  it('shows a single direction at the ends, and nothing off-order', () => {
    render(<ChapterPager slug="/two-cycles/" />)
    expect(screen.queryByText(/Previously/)).toBeNull()
    expect(screen.getByRole('link', { name: /What it is/ })).toBeTruthy()
    cleanup()
    render(<ChapterPager slug="/listen/" />)
    expect(screen.getByRole('link', { name: /The room/ })).toBeTruthy()
    expect(screen.queryByText(/Next/)).toBeNull()
    cleanup()
    const view = render(<ChapterPager slug="/sources/" />)
    expect(view.container.innerHTML).toBe('')
  })
})

describe('wayfinding: where am I (Plan-002)', () => {
  it('positionInPart counts within the part, and nulls off the map', () => {
    expect(positionInPart('/machine/what-the-tape-does/')).toEqual({
      part: 'The Machine',
      index: 3,
      count: 6,
    })
    expect(positionInPart('/two-cycles/')).toEqual({ part: 'Part I', index: 1, count: 1 })
    expect(positionInPart('/nowhere/')).toBeNull()
  })

  it('currentSection maps pathnames to rail entries, prefix or not', () => {
    expect(currentSection('/two-machines/machine/the-grammar/')).toBe('The Machine')
    expect(currentSection('/discipline/rhythm/')).toBe('The Discipline')
    expect(currentSection('/two-machines/two-cycles/')).toBe('Begin')
    expect(currentSection('/listen/')).toBe('Listen')
    expect(currentSection('/two-machines/sources/')).toBe('Sources')
    expect(currentSection('/two-machines/')).toBeNull()
  })

  it('the header marks the current section', () => {
    render(<SiteHeader path="/two-machines/machine/building-it/" />)
    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'true')
    expect(current.map((a) => a.textContent)).toEqual(['The Machine'])
  })

  it('the header marks nothing on the front page — home is home', () => {
    render(<SiteHeader path="/two-machines/" />)
    const current = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('aria-current') === 'true')
    expect(current).toEqual([])
  })

  it('the Map opens the whole reading order plus the beyond pages', () => {
    render(<SiteHeader path="/two-machines/machine/the-grammar/" />)
    const toggle = screen.getByRole('button', { name: 'Map' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    const map = screen.getByRole('navigation', { name: 'Everything on this site' })
    for (const stop of READING_ORDER) {
      expect(within(map).getByText(stop.title)).toBeTruthy()
    }
    // Beyond entries appear once, never duplicating a reading stop.
    expect(within(map).getByText('The Cycles engine')).toBeTruthy()
    expect(within(map).getByText('Colophon')).toBeTruthy()
    expect(within(map).getAllByText('Listen')).toHaveLength(1)
    fireEvent.click(toggle)
    expect(
      screen.queryByRole('navigation', { name: 'Everything on this site' })
    ).toBeNull()
  })

  it('Escape closes the Map', () => {
    render(<SiteHeader path="/two-machines/" />)
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(
      screen.queryByRole('navigation', { name: 'Everything on this site' })
    ).toBeNull()
  })

  it('other keys leave the Map open', () => {
    render(<SiteHeader path="/two-machines/" />)
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    fireEvent.keyDown(window, { key: 'a' })
    expect(
      screen.getByRole('navigation', { name: 'Everything on this site' })
    ).toBeTruthy()
  })

  it('navigating closes the Map — a chosen destination is an answer', () => {
    const { rerender } = render(<SiteHeader path="/two-machines/" />)
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    rerender(<SiteHeader path="/two-machines/listen/" />)
    expect(
      screen.queryByRole('navigation', { name: 'Everything on this site' })
    ).toBeNull()
  })

  it('the pager says where you sit inside the part', () => {
    render(<ChapterPager slug="/machine/the-grammar/" />)
    expect(screen.getByText('The Machine · 4 of 6')).toBeTruthy()
  })

  it('parts of one keep the pager quiet — no "1 of 1" ink', () => {
    render(<ChapterPager slug="/the-room/" />)
    expect(screen.queryByText(/1 of 1/)).toBeNull()
  })
})
