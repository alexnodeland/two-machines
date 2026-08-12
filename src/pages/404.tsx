import * as React from 'react'
import { Link } from 'gatsby'
import type { HeadFC, PageProps } from 'gatsby'

const NotFoundPage: React.FC<PageProps> = () => (
  <main
    style={{
      maxWidth: '42rem',
      margin: '0 auto',
      padding: '6rem 1.5rem',
      lineHeight: 1.6,
    }}
  >
    <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>
      Nothing on this reel
    </h1>
    <p>
      The page you asked for does not exist.{' '}
      <Link to="/" style={{ color: 'var(--aqua)' }}>
        Back to the start.
      </Link>
    </p>
  </main>
)

export default NotFoundPage

export const Head: HeadFC = () => <title>Not found · Two Machines</title>
