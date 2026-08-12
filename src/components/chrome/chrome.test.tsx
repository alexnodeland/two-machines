// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { CitationLink } from './CitationLink'
import { EditorialMark } from './EditorialMark'

vi.mock('gatsby', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

afterEach(cleanup)

describe('EditorialMark', () => {
  it('renders the default chip', () => {
    render(<EditorialMark />)
    const mark = screen.getByText('Our framing, not Fripp’s')
    expect(mark.getAttribute('data-editorial-mark')).toBe('true')
  })

  it('takes a sharper per-section label', () => {
    render(<EditorialMark label="Our analysis" />)
    expect(screen.getByText('Our analysis')).toBeTruthy()
  })

  it('structurally cannot carry a citation: no children are accepted', () => {
    // The ADR-003 rule is enforced by the component's type surface — this
    // test documents it against accidental widening.
    type Props = React.ComponentProps<typeof EditorialMark>
    const hasChildren: 'children' extends keyof Props ? true : false = false
    expect(hasChildren).toBe(false)
  })
})

describe('CitationLink', () => {
  it('links the claim to its /sources anchor in one click', () => {
    render(<CitationLink source="tamm-1990">the Tamm claim</CitationLink>)
    const link = screen.getByRole('link', { name: 'the Tamm claim' })
    expect(link.getAttribute('href')).toBe('/sources/#tamm-1990')
    expect(link.getAttribute('data-citation')).toBe('tamm-1990')
  })
})
