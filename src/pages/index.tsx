import * as React from 'react'
import { Link } from 'gatsby'
import type { HeadFC, PageProps } from 'gatsby'
import { createQuiverAudioNode } from '@quiver-dsp/wasm/audio'
import { getAudioContext } from '../audio/context'
import { getMasterBus } from '../audio/live'
import { createRigAudio } from '../audio/rig/node'
import { FirstLoop } from '../components/chrome/FirstLoop'
import { Rig, type RigAudioBoot } from '../components/instruments/Rig'

// Part 0 · The Instruments (docs/chapters/part-0-instruments.md): the Rig
// above everything, running before the reader has read anything — silently,
// audio needs a gesture. One paragraph of orientation. No more.

const AUDIO: RigAudioBoot = {
  getContext: getAudioContext,
  createRig: (ctx) => createRigAudio(ctx, createQuiverAudioNode),
  getOutput: (ctx) => getMasterBus(ctx),
  frames: {
    request: (fn) => requestAnimationFrame(fn),
    cancel: (handle) => cancelAnimationFrame(handle as number),
  },
}

const PARTS: [string, [string, string][]][] = [
  [
    'The Machine',
    [
      ['/machine/what-it-is/', 'What it is'],
      ['/machine/where-it-came-from/', 'Where it came from'],
      ['/machine/what-the-tape-does/', 'What the tape does to your music'],
      ['/machine/the-grammar/', 'The grammar'],
      ['/machine/the-four-modes/', 'The four modes'],
      ['/machine/building-it/', 'Building it'],
    ],
  ],
  [
    'The Discipline',
    [
      ['/discipline/rhythm/', 'The interlock'],
      ['/discipline/harmony/', 'The tuning'],
      ['/discipline/melody/', 'The line'],
      ['/discipline/where-the-numbers-come-from/', 'Where the numbers come from'],
    ],
  ],
  [
    'The Room & beyond',
    [
      ['/the-room/', 'Listening as an act of attention'],
      ['/listen/', 'Listen — what to put on'],
      ['/cycles/', 'The Cycles engine'],
      ['/sources/', 'Sources'],
      ['/colophon/', 'Colophon'],
    ],
  ],
]

const IndexPage: React.FC<PageProps> = ({ location }) => {
  // The first-loop guide reads the same URL state the Rig writes. Null until
  // the real location is read after mount — the Rig's own hydration
  // discipline — so a deep link is a baseline, never a completed step.
  const [query, setQuery] = React.useState<string | null>(null)
  React.useEffect(() => {
    setQuery(location.search)
  }, []) // mount-only by design: the arrival query is read once

  return (
    <main>
      <header>
        <p className="eyebrow">A study of Frippertronics, playable</p>
        <h1>Two Machines</h1>
        <p className="standfirst">
          Two reel-to-reel decks, one span of tape between them. Drag the far machine to
          set the distance — <strong>that distance is the delay</strong> — hold the pad to
          put something on the tape, and raise the playback level toward unity to hear it
          stay. Everything on this site works like this page: play first, read after.
        </p>
      </header>

      <FirstLoop query={query} />

      <Rig
        query={location.search}
        onQueryChange={(nextQuery) => {
          window.history.replaceState(
            null,
            '',
            nextQuery ? `?${nextQuery}` : location.pathname
          )
          setQuery(nextQuery)
        }}
        audio={AUDIO}
      />

      <nav aria-label="Contents" data-contents>
        <h2>Two halves</h2>
        <p>
          Begin with <Link to="/two-cycles/">Part I · Two cycles</Link> — clap five
          against seven and hear where everything on this site comes from.
        </p>
        {PARTS.map(([part, pages]) => (
          <section key={part}>
            <h3>{part}</h3>
            <ul>
              {pages.map(([to, title]) => (
                <li key={to}>
                  <Link to={to}>{title}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
    </main>
  )
}

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
