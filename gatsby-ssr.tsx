// SSR-only hooks. The html lang attribute is an axe/WCAG requirement
// (html-has-lang) and can only be set here.

import type { GatsbySSR } from 'gatsby'

export const onRenderBody: GatsbySSR['onRenderBody'] = ({ setHtmlAttributes }) => {
  setHtmlAttributes({ lang: 'en' })
}
