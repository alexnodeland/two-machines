#!/usr/bin/env node
/**
 * Two Machines — reference extractor
 *
 * Turns the fetched HTML in files/raw/ into clean Markdown in files/.
 *
 * A saved Wikipedia page is 280 KB of navigation, scripts and edit links
 * wrapped around 15 KB of article. That is unreadable as an archive and
 * useless for checking a quotation. Defuddle — the extraction engine behind
 * Obsidian's Web Clipper — finds the main content and drops the rest.
 *
 * Each output file carries YAML frontmatter tying it back to the manifest
 * entry, so a clean .md is still traceable to its source and its fetch date.
 *
 *   node extract.mjs            extract everything in files/raw/
 *   node extract.mjs <id> ...   extract only these
 */

import { readFile, writeFile, mkdir, readdir, stat, rename } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, basename } from 'node:path'

const RAW = 'files/raw'
const OUT = 'files'
const INBOX = 'inbox'
const MANIFEST = 'sources.yaml'

/** Anything that is not HTML is kept as-is; there is nothing to extract. */
const NOT_HTML = /\.(pdf|jpe?g|png|gif|webp|tiff?|epub|mp3|m4a|wav|zip)$/i

/** Minimal manifest read — id, url, title, author, accessed. Same flat-list
 *  assumption as fetch.sh; we only need a few scalars per record. */
async function readManifest() {
  const text = await readFile(MANIFEST, 'utf8')
  const records = {}
  let cur = null
  for (const line of text.split('\n')) {
    const idMatch = line.match(/^ {2}- id:\s*(.+?)\s*$/)
    if (idMatch) {
      cur = { id: idMatch[1] }
      records[cur.id] = cur
      continue
    }
    if (!cur) continue
    const kv = line.match(/^ {4}(title|author|url|accessed|publisher|date):\s*(.+?)\s*$/)
    if (kv && cur[kv[1]] === undefined) {
      let v = kv[2].replace(/^["']|["']$/g, '')
      if (v !== '>' && v !== '|') cur[kv[1]] = v
    }
  }
  return records
}

/**
 * Last-resort text extraction.
 *
 * Defuddle is heuristic and occasionally finds nothing on a page that plainly
 * has content — hand-rolled markup with no article container, for instance.
 * When that happens we would rather keep a rough text dump than a warning and
 * an empty file, so long as the output says which one it is.
 */
function fallbackText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|svg|noscript|iframe)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(nav|header|footer|aside)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|blockquote)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(+d))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function yamlEscape(s) {
  if (s === undefined || s === null) return ''
  const v = String(s)
  return /[:#"'\n]/.test(v) ? JSON.stringify(v) : v
}

/**
 * Adopt anything a human has dropped in inbox/.
 *
 * Several sources cannot be fetched by any script — a Cloudflare-protected
 * scan, a record sleeve, a book. Those get collected by hand. Dropping the
 * file in inbox/ named after its manifest id is the whole interface; this
 * moves it into raw/ so the rest of the pipeline treats it identically.
 */
async function intake(manifest) {
  if (!existsSync(INBOX)) return []
  const dropped = (await readdir(INBOX)).filter((f) => !f.startsWith('.') && f !== 'README.md')
  if (!dropped.length) return []

  const adopted = []
  console.log(`  Inbox: ${dropped.length} file(s)`)
  for (const file of dropped) {
    const id = basename(file).replace(/\.[^.]+$/, '')
    const known = Boolean(manifest[id])
    const dest = join(RAW, file)

    if (!known) {
      console.log(
        `  ! ${file.padEnd(30)} no manifest entry called "${id}" — left in ${INBOX}/`
      )
      continue
    }
    await mkdir(RAW, { recursive: true })
    await rename(join(INBOX, file), dest)
    adopted.push({ id, file, dest, extractable: !NOT_HTML.test(file) })
    console.log(`  → ${id.padEnd(30)} adopted into ${dest}`)
  }
  if (adopted.length) {
    console.log(
      '\n  Remember to set this source\'s fetch.status and archive path in sources.yaml.\n'
    )
  }
  return adopted
}

async function main() {
  if (!existsSync(RAW)) {
    console.error(`no ${RAW}/ — run ./fetch.sh first`)
    process.exit(1)
  }

  let Defuddle, parseHTML
  try {
    ;({ Defuddle } = await import('defuddle/node'))
    ;({ parseHTML } = await import('linkedom'))
  } catch {
    console.error('defuddle is not installed.\n  cd references && bun install')
    process.exit(3)
  }

  const manifest = await readManifest()
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'))

  const adopted = await intake(manifest)
  const kept = adopted.filter((a) => !a.extractable)
  if (kept.length) {
    console.log(
      `  ${kept.length} non-HTML file(s) stored as-is, nothing to extract: ` +
        kept.map((k) => k.id).join(', ') + '\n'
    )
  }

  const files = (await readdir(RAW)).filter((f) => /\.html?$/i.test(f))
  await mkdir(OUT, { recursive: true })

  let ok = 0
  let thin = 0
  let failed = 0

  for (const file of files) {
    const id = basename(file).replace(/\.html?$/i, '')
    if (only.length && !only.includes(id)) continue

    const meta = manifest[id] ?? {}
    const rawPath = join(RAW, file)
    const outPath = join(OUT, `${id}.md`)

    try {
      const html = await readFile(rawPath, 'utf8')
      const rawBytes = (await stat(rawPath)).size
      const { document } = parseHTML(html)
      const result = await Defuddle(document, meta.url ?? '', {
        markdown: true,
        useAsync: false, // no third-party fallbacks; archiving must be offline-safe
      })

      let body = (result.content ?? '').trim()
      let method = 'defuddle'
      let words = body.split(/\s+/).filter(Boolean).length

      // If Defuddle came up short, check whether the page actually has text.
      // A real application shell has none either way; a page Defuddle simply
      // failed to parse has plenty, and we keep that rather than lose it.
      if (words < 120) {
        const plain = fallbackText(html)
        const plainWords = plain.split(/\s+/).filter(Boolean).length
        if (plainWords > words * 3 && plainWords >= 120) {
          body = plain
          words = plainWords
          method = 'fallback-text'
        }
      }

      // Still nothing? Say so rather than writing a near-empty file that
      // looks like a successful extraction.
      const isThin = words < 120

      const fm = [
        '---',
        `source_id: ${id}`,
        `title: ${yamlEscape(result.title || meta.title || id)}`,
        meta.author ? `author: ${yamlEscape(meta.author)}` : null,
        result.author && result.author !== meta.author
          ? `page_author: ${yamlEscape(result.author)}`
          : null,
        meta.publisher ? `publisher: ${yamlEscape(meta.publisher)}` : null,
        meta.date ? `date: ${yamlEscape(meta.date)}` : null,
        result.published ? `published: ${yamlEscape(result.published)}` : null,
        meta.url ? `url: ${yamlEscape(meta.url)}` : null,
        meta.accessed ? `accessed: ${yamlEscape(meta.accessed)}` : null,
        `word_count: ${words}`,
        `extracted_from: ${rawPath}`,
        `extracted_with: ${method}`,
        isThin ? 'extraction_quality: thin' : null,
        '---',
        '',
        isThin
          ? '> [!warning] Thin extraction\n' +
            `> Defuddle found only ${words} words here. The page is probably an\n` +
            '> application shell, a directory listing, or paywalled. Check\n' +
            `> \`${rawPath}\` before trusting this file.\n`
          : null,
        body,
        '',
      ]
        .filter((l) => l !== null)
        .join('\n')

      await writeFile(outPath, fm, 'utf8')

      const pct = Math.round((Buffer.byteLength(body) / rawBytes) * 100)
      const tag = method === 'fallback-text' ? '  (fallback)' : ''
      if (isThin) {
        console.log(`  ~ ${id.padEnd(30)} ${String(words).padStart(6)} words  THIN`)
        thin++
      } else {
        console.log(
          `  ✓ ${id.padEnd(30)} ${String(words).padStart(6)} words  ${String(pct).padStart(3)}% of raw${tag}`
        )
        ok++
      }
    } catch (err) {
      console.log(`  ✗ ${id.padEnd(30)} ${String(err?.message ?? err).split('\n')[0]}`)
      failed++
    }
  }

  console.log(`\n  ${ok} clean · ${thin} thin · ${failed} failed`)
  if (thin) console.log('  Thin extractions are flagged in their frontmatter.')
}

main().catch((e) => {
  console.error(e?.stack ?? e)
  process.exit(1)
})
