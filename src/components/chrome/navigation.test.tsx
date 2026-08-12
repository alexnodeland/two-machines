// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, render, screen } from '@testing-library/react'

vi.mock('gatsby', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

import { SiteHeader } from './SiteHeader'
import { ChapterPager } from './ChapterPager'
import { nextStop, previousStop, READING_ORDER, stopIndex } from '../../data/readingOrder'

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
