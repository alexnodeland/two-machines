import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import { REFERENCES } from '../data/references'

// Part VI · Sources. Rendered from src/data/references.ts, which mirrors the
// bibliography (the single source of truth) — currently the hand-carried
// interim subset of entries cited by published chapters; the full generated
// version lands with the complete bibliography pass.

const SourcesPage: React.FC<PageProps> = () => (
  <main
    style={{
      maxWidth: '46rem',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      lineHeight: 1.65,
    }}
  >
    <p
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--ivory-dim)',
      }}
    >
      Part VI
    </p>
    <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>Sources</h1>
    <p>
      Every factual claim on this site links here. Each entry carries the date it was last
      verified. This page currently lists the sources cited by the published chapters; it
      grows with them.
    </p>
    <dl>
      {REFERENCES.map((ref) => (
        <div key={ref.key} id={ref.key} style={{ margin: '1.5rem 0' }}>
          <dt style={{ fontWeight: 600 }}>
            <a href={ref.url} style={{ color: 'var(--aqua)' }}>
              {ref.title}
            </a>
          </dt>
          <dd style={{ margin: '0.2rem 0 0 0', color: 'var(--ivory-dim)' }}>
            {ref.detail}{' '}
            <span data-readout style={{ fontSize: '0.85em' }}>
              verified {ref.verified}
            </span>
            {ref.note ? <em> — {ref.note}</em> : null}
          </dd>
        </div>
      ))}
    </dl>
  </main>
)

export default SourcesPage

export const Head: HeadFC = () => (
  <>
    <title>Sources · Two Machines</title>
    <meta
      name="description"
      content="The bibliography: every source cited on Two Machines, with verification dates."
    />
  </>
)
