import * as React from 'react'
import { Link } from 'gatsby'
import type { HeadFC, PageProps } from 'gatsby'
import { createQuiverAudioNode } from '@quiver-dsp/wasm/audio'
import { getAudioContext } from '../audio/context'
import { createRigAudio } from '../audio/rig/node'
import { Rig, type RigAudioBoot } from '../components/instruments/Rig'

// Part 0 · The Instruments (docs/chapters/part-0-instruments.md): the Rig
// above everything, running before the reader has read anything — silently,
// audio needs a gesture. One paragraph of orientation. No more.

const AUDIO: RigAudioBoot = {
  getContext: getAudioContext,
  createRig: (ctx) => createRigAudio(ctx, createQuiverAudioNode),
  frames: {
    request: (fn) => requestAnimationFrame(fn),
    cancel: (handle) => cancelAnimationFrame(handle as number),
  },
}

const IndexPage: React.FC<PageProps> = ({ location }) => (
  <main
    style={{
      maxWidth: '52rem',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      lineHeight: 1.6,
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
      Two Machines
    </p>
    <p>
      Two reel-to-reel decks, one span of tape between them. Drag the far machine to set
      the distance — that distance is the delay — hold the pad to put something on the
      tape, and raise the playback level toward unity to hear it stay. Everything on this
      site works like this page: play first, read after.
    </p>

    <Rig
      query={location.search}
      onQueryChange={(query) => {
        window.history.replaceState(null, '', query ? `?${query}` : location.pathname)
      }}
      audio={AUDIO}
    />

    <nav aria-label="Contents" style={{ marginTop: '3rem' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>
        Two halves
      </h2>
      <p>
        Start with the thesis:{' '}
        <Link to="/two-cycles/" style={{ color: 'var(--aqua)' }}>
          Part I · Two cycles
        </Link>
        . <strong>The Machine</strong>:{' '}
        <Link to="/machine/what-it-is/" style={{ color: 'var(--aqua)' }}>
          what it is
        </Link>
        {' · '}
        <Link to="/machine/where-it-came-from/" style={{ color: 'var(--aqua)' }}>
          where it came from
        </Link>
        {' · '}
        <Link to="/machine/what-the-tape-does/" style={{ color: 'var(--aqua)' }}>
          what the tape does to your music
        </Link>
        {' · '}
        <Link to="/machine/the-grammar/" style={{ color: 'var(--aqua)' }}>
          the grammar
        </Link>
        {' · '}
        <Link to="/machine/the-four-modes/" style={{ color: 'var(--aqua)' }}>
          the four modes
        </Link>
        {' · '}
        <Link to="/machine/building-it/" style={{ color: 'var(--aqua)' }}>
          building it
        </Link>
        . <strong>The Discipline</strong>:{' '}
        <Link
          to="/discipline/where-the-numbers-come-from/"
          style={{ color: 'var(--aqua)' }}
        >
          where the numbers come from
        </Link>{' '}
        {' · '}
        <Link to="/discipline/rhythm/" style={{ color: 'var(--aqua)' }}>
          the interlock
        </Link>
        {' · '}
        <Link to="/discipline/harmony/" style={{ color: 'var(--aqua)' }}>
          the tuning
        </Link>
        {' · '}
        <Link to="/discipline/melody/" style={{ color: 'var(--aqua)' }}>
          the line
        </Link>
        . <strong>The Room</strong>:{' '}
        <Link to="/the-room/" style={{ color: 'var(--aqua)' }}>
          listening as an act of attention
        </Link>
        . <strong>Listen</strong>:{' '}
        <Link to="/listen/" style={{ color: 'var(--aqua)' }}>
          the annotated curriculum
        </Link>
        . Instruments:{' '}
        <Link to="/cycles/" style={{ color: 'var(--aqua)' }}>
          the Cycles engine
        </Link>{' '}
        and the rig above. Sources:{' '}
        <Link to="/sources/" style={{ color: 'var(--aqua)' }}>
          the bibliography
        </Link>
        .
      </p>
    </nav>

    <footer style={{ marginTop: '3rem', color: 'var(--ivory-dim)', fontSize: '0.85rem' }}>
      Unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar Craft.
      &ldquo;Frippertronics&rdquo; is Robert Fripp&rsquo;s coined term, used here
      descriptively. All sound on this site is synthesised in your browser.{' '}
      <Link to="/colophon/" style={{ color: 'var(--aqua)' }}>
        Colophon
      </Link>
      .
    </footer>
  </main>
)

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <title>Two Machines</title>
    <meta
      name="description"
      content="A guide to tape-delay looping — the technique Fripp named Frippertronics — taught by letting you play it in the page."
    />
  </>
)
