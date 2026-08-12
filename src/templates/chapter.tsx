// The chapter shell: MDX content with the site's claim-marking chrome and
// instruments in scope, so lessons embed <Cycles preset="..."/> inline
// (tech-stack §1). Routing/layout shell only — behaviour lives in the
// components, and the shell is covered by e2e (see testing-strategy §3).

import * as React from 'react'
import type { HeadProps, PageProps } from 'gatsby'
import { MDXProvider } from '@mdx-js/react'
import { createQuiverAudioNode } from '@quiver-dsp/wasm/audio'
import { getAudioContext } from '../audio/context'
import { createRigAudio } from '../audio/rig/node'
import { CitationLink } from '../components/chrome/CitationLink'
import { EditorialMark } from '../components/chrome/EditorialMark'
import { AvoidingMud } from '../components/instruments/AvoidingMud'
import { BeepingDroning } from '../components/instruments/BeepingDroning'
import { Canon } from '../components/instruments/Canon'
import { Cycles } from '../components/instruments/Cycles'
import { DelayReadout } from '../components/instruments/DelayReadout'
import { Fretboards } from '../components/instruments/Fretboards'
import { NotCommitting } from '../components/instruments/NotCommitting'
import { SequencePlan } from '../components/instruments/SequencePlan'
import { Swells } from '../components/instruments/Swells'
import { ThreeNotes } from '../components/instruments/ThreeNotes'
import { type RigAudioBoot } from '../components/instruments/Rig'
import { DiscreetSchematic } from '../components/diagrams/DiscreetSchematic'
import { ChapterPager } from '../components/chrome/ChapterPager'
import { SiteFooter } from '../components/chrome/SiteFooter'

const AUDIO: RigAudioBoot = {
  getContext: getAudioContext,
  createRig: (ctx) => createRigAudio(ctx, createQuiverAudioNode),
  frames: {
    request: (fn) => requestAnimationFrame(fn),
    cancel: (handle) => cancelAnimationFrame(handle as number),
  },
}

const components = {
  CitationLink,
  EditorialMark,
  AvoidingMud: () => <AvoidingMud audio={AUDIO} />,
  BeepingDroning: (props: { preset?: 'beeping' | 'mud' }) => (
    <BeepingDroning audio={AUDIO} preset={props.preset ?? 'beeping'} />
  ),
  Canon: () => <Canon audio={AUDIO} />,
  Cycles,
  DelayReadout,
  DiscreetSchematic,
  Fretboards,
  NotCommitting: () => <NotCommitting audio={AUDIO} />,
  SequencePlan: () => <SequencePlan audio={AUDIO} />,
  Swells: () => <Swells audio={AUDIO} />,
  ThreeNotes: () => <ThreeNotes audio={AUDIO} />,
}

interface ChapterContext {
  frontmatter: { title: string; part: string; slug: string }
}

const ChapterTemplate: React.FC<PageProps<object, ChapterContext>> = ({
  children,
  pageContext,
}) => (
  <main>
    <p className="eyebrow">{pageContext.frontmatter.part}</p>
    <MDXProvider components={components}>{children}</MDXProvider>
    <ChapterPager slug={pageContext.frontmatter.slug} />
    <SiteFooter />
  </main>
)

export default ChapterTemplate

export const Head: React.FC<HeadProps<object, ChapterContext>> = ({ pageContext }) => (
  <title>{`${pageContext.frontmatter.title} · Two Machines`}</title>
)
