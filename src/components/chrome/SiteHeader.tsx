// The site header: one thin bar on every page, so a reader is never
// stranded. Wordmark home, the spine of the argument, and — new with the
// wayfinding pass — an honest answer to "where am I?": the current section
// is marked, and the Map button opens the whole reading order with the
// current page highlighted (Gatsby marks it aria-current for free).

import * as React from 'react'
import { Link } from 'gatsby'
import { READING_ORDER } from '../../data/readingOrder'

const LINKS: [string, string][] = [
  ['/two-cycles/', 'Begin'],
  ['/machine/what-it-is/', 'The Machine'],
  ['/discipline/rhythm/', 'The Discipline'],
  ['/listen/', 'Listen'],
  ['/sources/', 'Sources'],
]

/** Which hand-rail entry owns a pathname. Prefix-safe: it looks for the
 * unambiguous path segments, never at the origin end of the string. */
export const currentSection = (pathname: string): string | null => {
  if (pathname.includes('/machine/')) return 'The Machine'
  if (pathname.includes('/discipline/')) return 'The Discipline'
  if (pathname.includes('/two-cycles/')) return 'Begin'
  if (pathname.includes('/listen/')) return 'Listen'
  if (pathname.includes('/sources/')) return 'Sources'
  return null
}

const BEYOND: [string, string][] = [
  ['/the-room/', 'The room'],
  ['/listen/', 'Listen'],
  ['/cycles/', 'The Cycles engine'],
  ['/sources/', 'Sources'],
  ['/colophon/', 'Colophon'],
]

export const SiteHeader: React.FC<{ path?: string }> = ({ path = '' }) => {
  const [open, setOpen] = React.useState(false)
  const section = currentSection(path)

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Route changes close the map — a chosen destination is an answer.
  React.useEffect(() => {
    setOpen(false)
  }, [path])

  const parts: [string, typeof READING_ORDER][] = []
  for (const stop of READING_ORDER) {
    const last = parts[parts.length - 1]
    if (last && last[0] === stop.part) {
      ;(last[1] as (typeof READING_ORDER)[number][]).push(stop)
    } else {
      parts.push([stop.part, [stop]])
    }
  }

  return (
    <header data-site-header>
      <nav aria-label="Site">
        <Link to="/" data-wordmark>
          Two Machines
        </Link>
        <span data-header-links>
          {LINKS.map(([to, label]) => (
            <Link key={to} to={to} aria-current={section === label ? 'true' : undefined}>
              {label}
            </Link>
          ))}
        </span>
        <button
          type="button"
          data-map-toggle
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          Map
        </button>
      </nav>
      {open && (
        <nav aria-label="Everything on this site" data-map>
          {parts.map(([part, stops]) => (
            <div key={part} data-map-part>
              <span data-map-part-name>{part}</span>
              <ul>
                {stops.map((stop) => (
                  <li key={stop.slug}>
                    <Link to={stop.slug}>{stop.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div data-map-part>
            <span data-map-part-name>Beyond the argument</span>
            <ul>
              {BEYOND.filter(([to]) => !READING_ORDER.some((s) => s.slug === to)).map(
                ([to, label]) => (
                  <li key={to}>
                    <Link to={to}>{label}</Link>
                  </li>
                )
              )}
            </ul>
          </div>
        </nav>
      )}
    </header>
  )
}
