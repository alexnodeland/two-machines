// Global styles (the design tokens load once, site-wide) and the one
// page-level effect: every page renders inside the spine (D-022).

import * as React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import './src/styles/fonts.css'
import './src/styles/tokens.css'
import './src/styles/instruments.css'
import { Spine } from './src/components/chrome/Spine'
import { SiteHeader } from './src/components/chrome/SiteHeader'
import { SoundBar } from './src/components/chrome/SoundBar'
import { SiteFooter } from './src/components/chrome/SiteFooter'

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element, props }) => (
  <>
    <Spine />
    <SiteHeader path={props.location.pathname} />
    {element}
    <SiteFooter />
    <SoundBar />
  </>
)
