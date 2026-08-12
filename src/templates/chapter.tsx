// The chapter shell: MDX content with the site's claim-marking chrome and
// instruments in scope, so lessons embed <Cycles preset="..."/> inline
// (tech-stack §1). Routing/layout shell only — behaviour lives in the
// components, and the shell is covered by e2e (see testing-strategy §3).

import * as React from 'react'
import type { HeadProps, PageProps } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import { CitationLink } from '../components/chrome/CitationLink'
import { EditorialMark } from '../components/chrome/EditorialMark'
import { Cycles } from '../components/instruments/Cycles'
import { DiscreetSchematic } from '../components/diagrams/DiscreetSchematic'

const components = { CitationLink, EditorialMark, Cycles, DiscreetSchematic }

interface ChapterContext {
  frontmatter: { title: string; part: string }
}

const ChapterTemplate: React.FC<PageProps<object, ChapterContext>> = ({
  children,
  pageContext,
}) => (
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
      {pageContext.frontmatter.part}
    </p>
    <MDXProvider components={components}>{children}</MDXProvider>
  </main>
)

export default ChapterTemplate

export const Head: React.FC<HeadProps<object, ChapterContext>> = ({ pageContext }) => (
  <title>{`${pageContext.frontmatter.title} · Two Machines`}</title>
)
