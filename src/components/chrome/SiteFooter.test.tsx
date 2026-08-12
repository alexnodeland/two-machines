// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, render, screen } from '@testing-library/react'

vi.mock('gatsby', () => ({
  Link: ({ to, children }: { to: string; children: React.ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

import { SiteFooter } from './SiteFooter'

afterEach(cleanup)

describe('SiteFooter', () => {
  it('carries the non-affiliation statement verbatim and links the colophon', () => {
    render(<SiteFooter />)
    expect(
      screen.getByText(
        /Unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar\s+Craft/
      )
    ).toBeTruthy()
    expect(screen.getByText(/synthesised in your browser/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Colophon' }).getAttribute('href')).toBe(
      '/colophon/'
    )
  })
})
