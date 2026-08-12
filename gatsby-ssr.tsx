// SSR-only hooks. The html lang attribute is an axe/WCAG requirement
// (html-has-lang) and can only be set here.

import * as React from 'react'
import type { GatsbySSR } from 'gatsby'
import { Spine } from './src/components/chrome/Spine'

export const onRenderBody: GatsbySSR['onRenderBody'] = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: 'en' })
}

export const wrapPageElement: GatsbySSR['wrapPageElement'] = ({ element }) => (
  <>
    <Spine />
    {element}
  </>
)
