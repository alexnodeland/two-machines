// The site's reading order — one linear argument (information-architecture).
// The index contents, the header shortcuts and the chapter pager all derive
// from this single list, so navigation can never disagree with itself.

export interface ReadingStop {
  slug: string
  title: string
  part: string
}

export const READING_ORDER: readonly ReadingStop[] = [
  { slug: '/two-cycles/', title: 'Two cycles', part: 'Part I' },
  { slug: '/machine/what-it-is/', title: 'What it is', part: 'The Machine' },
  {
    slug: '/machine/where-it-came-from/',
    title: 'Where it came from',
    part: 'The Machine',
  },
  {
    slug: '/machine/what-the-tape-does/',
    title: 'What the tape does to your music',
    part: 'The Machine',
  },
  { slug: '/machine/the-grammar/', title: 'The grammar', part: 'The Machine' },
  { slug: '/machine/the-four-modes/', title: 'The four modes', part: 'The Machine' },
  { slug: '/machine/building-it/', title: 'Building it', part: 'The Machine' },
  { slug: '/discipline/rhythm/', title: 'The interlock', part: 'The Discipline' },
  { slug: '/discipline/harmony/', title: 'The tuning', part: 'The Discipline' },
  { slug: '/discipline/melody/', title: 'The line', part: 'The Discipline' },
  {
    slug: '/discipline/where-the-numbers-come-from/',
    title: 'Where the numbers come from',
    part: 'The Discipline',
  },
  { slug: '/the-room/', title: 'The room', part: 'Part IV' },
  { slug: '/listen/', title: 'Listen', part: 'Part V' },
]

export const stopIndex = (slug: string): number =>
  READING_ORDER.findIndex((stop) => stop.slug === slug)

export const previousStop = (slug: string): ReadingStop | null => {
  const i = stopIndex(slug)
  return i > 0 ? (READING_ORDER[i - 1] as ReadingStop) : null
}

export const nextStop = (slug: string): ReadingStop | null => {
  const i = stopIndex(slug)
  return i >= 0 && i < READING_ORDER.length - 1
    ? (READING_ORDER[i + 1] as ReadingStop)
    : null
}

/** Where a chapter sits inside its part — "The Machine · 3 of 6". Parts of
 * one (the thesis, the room) return count 1 and let the caller decide
 * whether a position line earns its ink. */
export const positionInPart = (
  slug: string
): { part: string; index: number; count: number } | null => {
  const stop = READING_ORDER[stopIndex(slug)]
  if (!stop) return null
  const siblings = READING_ORDER.filter((s) => s.part === stop.part)
  return {
    part: stop.part,
    index: siblings.findIndex((s) => s.slug === stop.slug) + 1,
    count: siblings.length,
  }
}
