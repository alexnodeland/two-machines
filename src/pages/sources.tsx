import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import { SOURCE_GROUPS, type SourceEntry } from '../data/sources.generated'
import { SiteFooter } from '../components/chrome/SiteFooter'

// Part VI · Sources (docs/chapters/part-6-sources.md): GENERATED, not
// hand-written. references/sources.yaml is the single source of truth;
// scripts/generate-sources.mjs renders it to src/data/sources.generated.ts,
// and `just check` fails on drift. Grouping mirrors the manifest's own
// sections; every citation anchor on the site resolves to an id here.

/** Verification status, reported exactly as known (never rounded up). */
const statusNote = (entry: SourceEntry): string | null => {
  if (entry.status === 'dead') return 'dead link — the Wayback snapshot is linked'
  if (entry.status === 'blocked')
    return 'refuses automated fetch (403 to bots); reachable in a browser'
  if (entry.status === 'manual')
    return 'not fetchable by script (a book, a video, a physical object)'
  return null
}

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
      Every factual claim on this site resolves here in one click. This page is generated
      from the reference manifest — nothing is cited anywhere on the site that is not in
      it — and each entry carries the date it was last verified. Verification status is
      reported exactly as known: a dead link is labelled dead and points at its Wayback
      snapshot; a page that refuses robots is recorded as that, not as dead. Offline
      archive copies exist for reproducibility but are never committed or served.
    </p>
    {SOURCE_GROUPS.map((group) => (
      <section key={group.title}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>
          {group.title}
        </h2>
        <dl>
          {group.entries.map((entry) => {
            const note = statusNote(entry)
            const href =
              entry.status === 'dead' ? (entry.archiveUrl ?? entry.url) : entry.url
            return (
              <div key={entry.id} id={entry.id} style={{ margin: '1.5rem 0' }}>
                <dt style={{ fontWeight: 600 }}>
                  <a href={href}>{entry.title}</a>
                </dt>
                <dd style={{ margin: '0.2rem 0 0 0', color: 'var(--ivory-dim)' }}>
                  {[entry.author, entry.publisher, entry.date]
                    .filter(Boolean)
                    .join(' · ')}
                  {entry.author || entry.publisher || entry.date ? ' ' : ''}
                  <span data-readout style={{ fontSize: '0.85em' }}>
                    verified {entry.verified}
                  </span>
                  {note ? <em> — {note}</em> : null}
                </dd>
              </div>
            )
          })}
        </dl>
      </section>
    ))}
    <SiteFooter />
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
