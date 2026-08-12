import * as React from 'react'
import { Link } from 'gatsby'
import type { HeadFC, PageProps } from 'gatsby'

// The colophon (docs/chapters/colophon.md): what this is, who made it, the
// non-affiliation statement verbatim from rights-and-legal §5, the licences,
// and the editorial-mark system explained once, in one place.

const ColophonPage: React.FC<PageProps> = () => (
  <main
    style={{
      maxWidth: '46rem',
      margin: '0 auto',
      padding: '3rem 1.5rem',
      lineHeight: 1.65,
    }}
  >
    <h1 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>
      Colophon
    </h1>

    <p>
      <strong>Two Machines</strong> is a guide to tape-delay looping — the technique
      Robert Fripp named Frippertronics — taught by letting you play every concept in the
      page. It is written, built and maintained by{' '}
      <a href="https://github.com/alexnodeland" style={{ color: 'var(--aqua)' }}>
        Alex Nodeland
      </a>
      . The specification, source code and full decision record are public in{' '}
      <a
        href="https://github.com/alexnodeland/two-machines"
        style={{ color: 'var(--aqua)' }}
      >
        the repository
      </a>
      .
    </p>

    <blockquote
      style={{
        borderLeft: '3px solid var(--brass)',
        paddingLeft: '1rem',
        color: 'var(--ivory-dim)',
      }}
    >
      Unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar Craft.
      &ldquo;Frippertronics&rdquo; is Robert Fripp&rsquo;s coined term, used here
      descriptively. No audio is hosted; every listening reference links out. All sound on
      this site is synthesised in your browser.
    </blockquote>

    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>
      Which claims are ours
    </h2>
    <p>
      The site distinguishes three kinds of claim, typographically. A sourced fact carries
      a dotted link to{' '}
      <Link to="/sources/" style={{ color: 'var(--aqua)' }}>
        the bibliography
      </Link>
      , where every entry shows the date it was last verified. A quotation is attributed
      inline and linked the same way. And the site&rsquo;s own analysis — the two-cycles
      thesis first among it — wears a visible brass chip (&ldquo;our framing&rdquo;,
      &ldquo;ours&rdquo;, &ldquo;our reasoning&rdquo; — the label names the kind of claim)
      and never carries a citation, because a footnote on an opinion would dress it as
      fact. If a marked claim reads as wrong, it is ours to answer for; the contact
      address below reaches a person.
    </p>

    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>
      Licences
    </h2>
    <p>
      Code is MIT. Prose and research are CC BY-NC-SA 4.0. Quoted material remains the
      property of its rights holders and is not relicensed by either. The site is
      non-commercial: nothing is sold, no analytics run, no data is collected.
    </p>

    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--unison)' }}>Contact</h2>
    <p data-contact>
      <a href="mailto:alex@ournature.studio" style={{ color: 'var(--aqua)' }}>
        alex@ournature.studio
      </a>{' '}
      — monitored; corrections and takedown requests answered by a person.
    </p>
  </main>
)

export default ColophonPage

export const Head: HeadFC = () => (
  <>
    <title>Colophon · Two Machines</title>
    <meta
      name="description"
      content="What Two Machines is, who made it, and its licences."
    />
  </>
)
