// Previous/next through the reading order, at the foot of every chapter.
// The argument is linear; the pager keeps a reader moving through it without
// a trip back to the contents.

import * as React from 'react'
import { Link } from 'gatsby'
import { nextStop, previousStop } from '../../data/readingOrder'

export const ChapterPager: React.FC<{ slug: string }> = ({ slug }) => {
  const prev = previousStop(slug)
  const next = nextStop(slug)
  if (!prev && !next) return null
  return (
    <nav aria-label="Chapters" data-pager>
      {prev ? (
        <Link to={prev.slug} rel="prev">
          <span>← Previously</span>
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={next.slug} rel="next" data-pager-next>
          <span>Next →</span>
          {next.title}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
