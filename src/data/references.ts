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
    key: 'gaskin-1979',
    title: 'August 1979 interview with Robert Fripp (Ron Gaskin)',
    detail:
      'Unnamed Toronto music tabloid, August 1979; transcribed by Jim Price, Elephant Talk, 17 July 1996. The clearest mechanical description Fripp gave of the two-machine system.',
    url: 'https://www.elephant-talk.com/wiki/August_1979_interview_with_Robert_Fripp',
    verified: '11 August 2026',
    note: 'Verified against the Wayback snapshot of 17 February 2025.',
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
    key: 'robertson-2017',
    title: 'Robert Fripp, Guitar Craft, and the Gurdjieff tradition',
    detail:
      'David Robertson, Journal of Religion and Popular Culture / Open Research Online. Peer-reviewed treatment of the doctrinal sources.',
    url: 'https://oro.open.ac.uk/68544',
    verified: '11 August 2026',
    note: 'Open access; the server refuses automated clients — open it in a browser.',
  },
  {
    key: 'scorranese-2025',
    title: 'Digital Morphophone Environment',
    detail:
      'Daniel Scorranese, Proc. DAFx25, Ancona, September 2025. Dates and describes Poullin’s morphophone (1953): a tape loop on a rotating wheel, one record head, ten repositionable playback heads.',
    url: 'https://dafx.de/paper-archive/2025/DAFx25_paper_70.pdf',
    verified: '11 August 2026',
  },
  {
    key: 'akg-conrad',
    title: 'Introducing Tony Conrad: A Retrospective — object labels',
    detail:
      'Buffalo AKG Art Museum. Dates the score of Three Loops for Performers and Tape Recorders to 8–21 November 1961.',
    url: 'https://buffaloakg.org/sites/default/files/tony_conrad_wall_text_and_object_labels.pdf',
    verified: '11 August 2026',
  },
  {
    key: 'sigsym-1',
    title: 'Sign & Symptoms |1| Frippertronics',
    detail:
      'Harold Schellinx, HarSMedia. Quotes Conrad’s 1961 score appendix and makes the came-with-the-machine point.',
    url: 'https://www.harsmedia.com/Amphibious/Projects/sigsym.html',
    verified: '11 August 2026',
  },
  {
    key: 'ircam-riley',
    title: 'Terry Riley — parcours de l’œuvre',
    detail:
      'Max Noubel, IRCAM B.R.A.H.M.S. The Time Lag Accumulator: two recorders, one tape stretched across both, Paris 1963, Music for The Gift.',
    url: 'https://ressources.ircam.fr/en/composer/terry-riley/workcourse',
    verified: '11 August 2026',
  },
  {
    key: 'oliveros-econtact',
    title: 'What Matters? Make the Music!',
    detail:
      'Pauline Oliveros, eContact! 17.3. Her own account of running one reel of tape across two machines, and the four-channel two-machine system behind I of IV (1966).',
    url: 'https://econtact.ca/17_3/oliveros_music.html',
    verified: '11 August 2026',
  },
  {
    key: 'tamm-1990',
    title: 'Robert Fripp: From King Crimson to Guitar Craft',
    detail: 'Eric Tamm, Faber & Faber, 1990. Full text on the Internet Archive.',
    url: 'https://archive.org/details/robert-fripp-from-king-crimson-to-guitar-craft_202103',
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
