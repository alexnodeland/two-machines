// INTERIM, HAND-BUILT — carries only the entries cited by published chapters
// so far. The real pipeline generates this file from
// docs/architecture/bibliography.md (the single source of truth; nothing may
// be cited that is not in that file), and lands with Part VI. Every entry
// here IS in the bibliography; keep it that way until generation replaces
// this file.

export interface Reference {
  /** The /sources anchor, cited as <CitationLink source="..."> */
  key: string
  title: string
  detail: string
  url: string
  /** Content-methodology §4: each entry carries a last-verified date. */
  verified: string
  note?: string
}

export const REFERENCES: readonly Reference[] = [
  {
    key: 'lamont-1',
    title: 'How I play Frippertronics, part 1',
    detail: 'Norman Lamont. The three-note grammar and the sequence-plan format.',
    url: 'https://normanlamont.com/how-i-play-frippertronics/',
    verified: '11 August 2026',
  },
  {
    key: 'lamont-2',
    title: 'How I play Frippertronics, part 2',
    detail: 'Norman Lamont. The mud description; sit-and-listen practice.',
    url: 'https://normanlamont.com/how-to-play-frippertronics-2/',
    verified: '11 August 2026',
  },
  {
    key: 'tooley-1979',
    title: 'Interview with Robert Fripp by Dick Tooley',
    detail:
      'College radio, Winnipeg, 9 August 1979, before a Frippertronics performance at the Winnipeg Art Gallery. Transcribed on the Elephant Talk wiki.',
    url: 'https://www.elephant-talk.com/wiki/Interview_with_Robert_Fripp_by_Dick_Tooley',
    verified: '11 August 2026',
  },
  {
    key: 'michigan-daily-1979',
    title: '“Second Chance rips out”, Keith Tosolt',
    detail: 'The Michigan Daily, 14 June 1979, p. 7.',
    url: 'https://digital.bentley.umich.edu/midaily/mdp.39015071754555/519',
    verified: '11 August 2026',
    note: 'Read from the live archive on the verification date; awaiting a manually captured copy.',
  },
]
