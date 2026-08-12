// Part VI generation (docs/chapters/part-6-sources.md): /sources renders the
// reference manifest, never hand-written prose. This script turns
// references/sources.yaml into src/data/sources.generated.ts. The output is
// committed so typecheck stays hermetic; `just check` regenerates and fails
// on drift, which is what "generated, not hand-written" means in CI terms.
//
// Grouping comes from the manifest's own section banners, so the page's
// groups mirror the corpus one-for-one and cannot drift from it.

import process from 'node:process'
import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { load as yamlLoad } from 'js-yaml'

const RAW = readFileSync('references/sources.yaml', 'utf8')
const doc = yamlLoad(RAW)

// Map each source id to the banner section it sits under.
const sectionOf = new Map()
let current = null
let afterRule = false
for (const line of RAW.split('\n')) {
  if (/^ {2}# ─{5,}/.test(line)) {
    afterRule = true
    continue
  }
  if (afterRule) {
    const banner = line.match(/^ {2}# (.+)$/)
    if (banner) current = banner[1].trim()
    afterRule = false
    continue
  }
  const id = line.match(/^ {2}- id: (.+)$/)
  if (id && current) sectionOf.set(id[1].trim(), current)
}

const TITLES = {
  "PRIMARY — Fripp's own words": "Primary — Fripp's own words",
  SCHOLARLY: 'Scholarly',
  'HISTORY AND MECHANISM': 'History and mechanism',
  'METHOD AND MODERN PRACTICE': 'Method and modern practice',
  'RHYTHM, THE INTERLOCK, THE TUNING': 'Rhythm, the interlock, the tuning',
  'GURDJIEFF AND BENNETT': 'Gurdjieff and Bennett',
  'TECHNICAL — for the engineering documents': 'Technical references',
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const prettyDate = (iso) => {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return String(iso)
  return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`
}

const groups = []
const groupByTitle = new Map()
for (const src of doc.sources) {
  const banner = sectionOf.get(src.id)
  const title = TITLES[banner] ?? banner ?? 'Ungrouped'
  if (!groupByTitle.has(title)) {
    const group = { title, entries: [] }
    groupByTitle.set(title, group)
    groups.push(group)
  }
  const status = src.fetch?.status ?? 'manual'
  groupByTitle.get(title).entries.push({
    id: src.id,
    title: String(src.title),
    author: src.author ? String(src.author) : null,
    date: src.date ? String(src.date) : null,
    publisher: src.publisher ? String(src.publisher) : null,
    url: String(src.url ?? src.url_archive ?? ''),
    archiveUrl: src.url_archive ? String(src.url_archive) : null,
    status,
    verified: prettyDate(src.accessed ?? doc.meta.verified),
  })
}

const banner_ = `// GENERATED from references/sources.yaml by scripts/generate-sources.mjs.
// Do not edit by hand — edit the manifest and re-run \`bun run generate:sources\`.
// \`just check\` fails on drift between this file and the manifest.`

const out = `${banner_}

export interface SourceEntry {
  id: string
  title: string
  author: string | null
  date: string | null
  publisher: string | null
  url: string
  archiveUrl: string | null
  /** ok | browser | blocked | manual | dead — verbatim from the manifest. */
  status: string
  verified: string
}

export interface SourceGroup {
  title: string
  entries: SourceEntry[]
}

export const SOURCE_GROUPS: readonly SourceGroup[] = ${JSON.stringify(groups, null, 2)}
`
writeFileSync('src/data/sources.generated.ts', out)
// Prettier-format the output so the committed file and a fresh generation
// are byte-identical — the drift check in `just check` depends on it.
execSync('bunx prettier --write src/data/sources.generated.ts', { stdio: 'ignore' })
process.stdout.write(
  `generated ${groups.length} groups, ${doc.sources.length} sources -> src/data/sources.generated.ts\n`
)
