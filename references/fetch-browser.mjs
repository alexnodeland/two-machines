#!/usr/bin/env node
/**
 * Two Machines — browser-backed reference archiver
 *
 * The companion to fetch.sh. curl handles the 29 sources that serve plain
 * HTML; this handles the ones that don't:
 *
 *   - Cloudflare / "Checking your browser" interstitials that resolve only
 *     after JS runs (ragajunglism, Bentley Library)
 *   - JS-rendered app shells that return no content to a non-browser client
 *     (Substack)
 *   - Origins that 403 or 520 a bare curl but serve a real browser
 *
 * It does NOT bypass anything. It waits for a challenge to resolve the same
 * way a person's browser does, then saves what the page actually renders.
 * Anything requiring a login, a payment, or a CAPTCHA solved on our behalf
 * stays `manual` in sources.yaml — see README.
 *
 * Input:  NDJSON on stdin, one {id, url, out} per line (fetch.sh supplies it)
 * Output: NDJSON on stdout, one {id, ok, bytes, reason} per line
 *
 * Alongside each .html it writes a .txt of the rendered innerText. For several
 * of these sources — the Michigan Daily scan in particular — the text is the
 * thing you actually want to read and quote.
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

/** Markers that mean "this is an interstitial, not the page". */
const CHALLENGE = /just a moment|checking your browser|attention required|enable javascript|verifying you are human|ddos protection/i

/**
 * Persistent browser profile. Kept so a Cloudflare clearance cookie survives
 * between runs — solve the challenge once, sail through afterwards.
 * Gitignored; disposable.
 */
const PROFILE = '.browser-profile'

const NAV_TIMEOUT = 45_000
/** Cloudflare's managed challenge can take a while on a cold IP. */
const CHALLENGE_TIMEOUT = 75_000
const POLL = 1_000
/** Substack and friends keep streaming after load; give them a beat. */
const SETTLE = 1_500

function readStdin() {
  return new Promise((resolve) => {
    let buf = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (d) => (buf += d))
    process.stdin.on('end', () => resolve(buf))
  })
}

/** Wait for a challenge interstitial to clear, the way a person waits. */
async function waitOutChallenge(page) {
  const deadline = Date.now() + CHALLENGE_TIMEOUT
  while (Date.now() < deadline) {
    const title = await page.title().catch(() => '')
    if (!CHALLENGE.test(title)) return true
    await page.waitForTimeout(POLL)
  }
  return false
}

async function main() {
  const raw = await readStdin()
  const jobs = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l))

  if (jobs.length === 0) {
    process.stderr.write('no jobs on stdin\n')
    process.exit(0)
  }

  let chromiumMod
  try {
    chromiumMod = (await import('playwright')).chromium
  } catch {
    process.stderr.write(
      'playwright is not installed.\n' +
        '  cd references && bun install\n' +
        '(Chromium is likely already cached; if not, bunx playwright install chromium)\n'
    )
    // Not a hard failure: curl-fetchable sources still work without this.
    for (const j of jobs) {
      process.stdout.write(
        JSON.stringify({ id: j.id, ok: false, reason: 'playwright not installed' }) + '\n'
      )
    }
    process.exit(3)
  }

  /*
   * One pass over a set of jobs.
   *
   * Uses a PERSISTENT profile, deliberately: Cloudflare hands out a clearance
   * cookie once a challenge is solved, and keeping it means later runs sail
   * through where a fresh profile would be challenged again.
   *
   * Prefers real Chrome over bundled Chromium — Cloudflare fingerprints
   * headless Chromium and will sit on it indefinitely. Falls back to the
   * bundled build where Chrome is absent (CI), which is fine for every source
   * except the Cloudflare-protected ones.
   */
  async function runPass(batch, { headless }) {
    let ctx, launchedWith
    for (const opts of [{ channel: 'chrome' }, {}]) {
      try {
        ctx = await chromiumMod.launchPersistentContext(PROFILE, {
          headless,
          userAgent: UA,
          viewport: { width: 1440, height: 900 },
          locale: 'en-GB',
          timezoneId: 'Europe/London',
          // Stop Chrome advertising that it is being automated. This is not
          // evasion of a protection — no CAPTCHA is solved, no rate limit is
          // dodged — it just prevents a challenge from firing on a browser
          // that is otherwise behaving exactly like a person's.
          args: ['--disable-blink-features=AutomationControlled'],
          ignoreDefaultArgs: ['--enable-automation'],
          ...opts,
        })
        launchedWith = opts.channel ?? 'bundled chromium'
        break
      } catch {
        /* try the next */
      }
    }
    if (!ctx) throw new Error('could not launch a browser')
    process.stderr.write(`launched: ${launchedWith} (${headless ? 'headless' : 'headful'})\n`)

    const page = ctx.pages()[0] ?? (await ctx.newPage())
    page.setDefaultNavigationTimeout(NAV_TIMEOUT)
    const results = []

    for (const job of batch) {
      const result = { id: job.id, ok: false, bytes: 0, reason: '' }
      try {
        const resp = await page.goto(job.url, { waitUntil: 'domcontentloaded' })
        const cleared = await waitOutChallenge(page)
        if (!cleared) {
          result.reason = `challenge did not clear within ${CHALLENGE_TIMEOUT / 1000}s`
          result.challenge = true
          results.push(result)
          continue
        }

        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
        await page.waitForTimeout(SETTLE)

        const html = await page.content()
        const text = await page.evaluate(() => document.body?.innerText ?? '')

        if (CHALLENGE.test(html.slice(0, 3000))) {
          result.reason = 'still an interstitial after wait'
          result.challenge = true
        } else if (html.length < 2000) {
          result.reason = `suspiciously small (${html.length} bytes)`
        } else {
          await mkdir(dirname(job.out), { recursive: true })
          await writeFile(job.out, html, 'utf8')
          await writeFile(job.out.replace(/\.html?$/i, '') + '.txt', text, 'utf8')
          result.ok = true
          result.bytes = html.length
          result.status = resp?.status() ?? null
        }
      } catch (err) {
        result.reason = String(err?.message ?? err).split('\n')[0]
      }
      results.push(result)
    }

    await ctx.close()
    return results
  }

  // Pass 1: headless. Anything defeated by a challenge escalates to a visible
  // browser, which is what actually clears a Cloudflare managed challenge.
  // Set TM_HEADFUL=1 to skip straight there; TM_NO_ESCALATE=1 to never.
  const startHeadless = process.env.TM_HEADFUL !== '1'
  let results = await runPass(jobs, { headless: startHeadless })

  const stuck = results.filter((r) => r.challenge)
  if (stuck.length && startHeadless && process.env.TM_NO_ESCALATE !== '1') {
    process.stderr.write(
      `${stuck.length} blocked by a challenge — retrying with a visible browser.\n` +
        'A window will open; leave it alone until it finishes.\n'
    )
    const retryJobs = jobs.filter((j) => stuck.some((s) => s.id === j.id))
    const retried = await runPass(retryJobs, { headless: false })
    results = results.filter((r) => !r.challenge).concat(retried)
  }

  for (const r of results) process.stdout.write(JSON.stringify(r) + '\n')
}

main().catch((e) => {
  process.stderr.write(String(e?.stack ?? e) + '\n')
  process.exit(1)
})
