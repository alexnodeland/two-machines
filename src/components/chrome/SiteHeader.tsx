// The site header: one thin bar on every page, so a reader is never
// stranded. Wordmark home, then the spine of the argument — begin, the two
// halves, the listening list, the sources. The full contents live on the
// front page; this is a hand-rail, not a sitemap.

import * as React from 'react'
import { Link } from 'gatsby'

const LINKS: [string, string][] = [
  ['/two-cycles/', 'Begin'],
  ['/machine/what-it-is/', 'The Machine'],
  ['/discipline/rhythm/', 'The Discipline'],
  ['/listen/', 'Listen'],
  ['/sources/', 'Sources'],
]

export const SiteHeader: React.FC = () => (
  <header data-site-header>
    <nav aria-label="Site">
      <Link to="/" data-wordmark>
        Two Machines
      </Link>
      <span data-header-links>
        {LINKS.map(([to, label]) => (
          <Link key={to} to={to}>
            {label}
          </Link>
        ))}
      </span>
    </nav>
  </header>
)
