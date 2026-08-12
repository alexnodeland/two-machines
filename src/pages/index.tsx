import * as React from 'react'
import type { HeadFC, PageProps } from 'gatsby'

const styles: Record<string, React.CSSProperties> = {
  main: {
    maxWidth: '42rem',
    margin: '0 auto',
    padding: '6rem 1.5rem',
    lineHeight: 1.6,
  },
  kicker: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ivory-dim)',
  },
  h1: {
    fontFamily: 'var(--font-display)',
    color: 'var(--unison)',
  },
  thesis: {
    fontSize: '1.15rem',
    fontStyle: 'italic',
    borderLeft: '3px solid var(--brass)',
    paddingLeft: '1rem',
    margin: '2rem 0',
  },
}

const IndexPage: React.FC<PageProps> = () => (
  <main style={styles.main}>
    <p style={styles.kicker}>Two Machines · under construction</p>
    <h1 style={styles.h1}>
      Two cycles of incommensurate length, and what happens when they realign.
    </h1>
    <p style={styles.thesis}>
      A tape delay is a fixed cycle running against your phrase length. This site will
      teach tape-delay looping — the technique Fripp named Frippertronics — by letting you
      play every concept in the page.
    </p>
    <p>
      Nothing is playable here yet. The specification is complete and the engines are
      being built; this placeholder exists so the deployment pipeline is proven before
      anything substantial ships on it.
    </p>
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
