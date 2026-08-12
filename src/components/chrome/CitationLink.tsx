// A citation (content-methodology §4): every factual claim links to /sources
// in one click. The target key must exist in the bibliography — /sources is
// generated from it, and nothing is cited that is not in that file.

import * as React from 'react'
import { Link } from 'gatsby'

export interface CitationLinkProps {
  /** The bibliography anchor on /sources, e.g. "tamm-1990". */
  source: string
  children: React.ReactNode
}

export const CitationLink: React.FC<CitationLinkProps> = ({ source, children }) => (
  <Link to={`/sources/#${source}`} data-citation={source}>
    {children}
  </Link>
)
