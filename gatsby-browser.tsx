// Global styles (the design tokens load once, site-wide) and the one
// page-level effect: every page renders inside the spine (D-022).

import * as React from 'react'
import type { GatsbyBrowser } from 'gatsby'
import './src/styles/fonts.css'
import './src/styles/tokens.css'
import { Spine } from './src/components/chrome/Spine'

export const wrapPageElement: GatsbyBrowser['wrapPageElement'] = ({ element }) => (
  <>
    <Spine />
    {element}
  </>
)
