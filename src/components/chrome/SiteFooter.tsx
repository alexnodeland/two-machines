// The non-affiliation statement, in the footer of every page (rights-and-legal
// §5 and §8's compliance checklist). One component so the wording can never
// drift between pages.

import * as React from 'react'
import { Link } from 'gatsby'

export const SiteFooter: React.FC = () => (
  <footer
    data-site-footer
    style={{ marginTop: '3rem', color: 'var(--ivory-dim)', fontSize: '0.85rem' }}
  >
    Unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar Craft.
    &ldquo;Frippertronics&rdquo; is Robert Fripp&rsquo;s coined term, used here
    descriptively. All sound on this site is synthesised in your browser.{' '}
    <Link to="/colophon/">Colophon</Link>.
  </footer>
)
