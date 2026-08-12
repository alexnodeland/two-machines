import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'
import { Cycles } from '../components/instruments/Cycles'

// The Cycles engine, full-page. An instrument, not a chapter: minimal prose,
// deep-linked from Part I and chapter 8 (docs/chapters/cycles.md).

const CyclesPage: React.FC<PageProps> = () => (
  <main
    style={{
      maxWidth: '52rem',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      lineHeight: 1.6,
    }}
  >
    <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>
      The Cycles engine
    </h1>
    <p>
      N cycles against a shared pulse. Load a preset, or build your own in the rack —
      editing is the point.
    </p>
    <Cycles />
    <p style={{ color: 'var(--ivory-dim)', fontSize: '0.9rem' }}>
      {/* The rights guarantee is printed here, not just recorded in the spec
          (ADR-017, ADR-031). */}
      The King Crimson presets carry a cycle length and a downbeat — public analytical
      fact — and nothing else. No pattern is reproduced; anything beyond the downbeat is
      yours to build. Tempos are chosen for audibility, not fidelity: on the record,{' '}
      <em>Discipline</em>&rsquo;s sixteenths run near 480 to the minute, too fast to hear
      the interlock as an interlock.
    </p>
  </main>
)

export default CyclesPage

export const Head: HeadFC = () => (
  <>
    <title>Cycles · Two Machines</title>
    <meta
      name="description"
      content="N cycles against a shared pulse: the Cycles engine, the thesis in playable form."
    />
  </>
)
