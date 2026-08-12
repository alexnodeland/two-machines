# References

Offline copies of every source the site cites, plus the directory that tracks them.

```
references/
  sources.yaml       the directory — id, title, author, url, local file, status
  fetch.sh           fetches raw HTML into files/raw/  (curl)
  fetch-browser.mjs  the same for JS-rendered pages    (Playwright)
  extract.mjs        raw HTML → clean Markdown         (Defuddle)
  package.json       the dev dependencies, local to this directory
  files/
    *.md             ← what you read: clean text with frontmatter
    raw/             ← the fetched HTML, kept only so extraction is re-runnable
  README.md          this
```

## Read the `.md`, not the `raw/`

A saved Wikipedia page is 280 KB of navigation, scripts and edit links wrapped
around 15 KB of article. Unreadable as an archive, useless for checking a
quotation.

[Defuddle](https://github.com/kepano/defuddle) — the extraction engine behind
Obsidian's Web Clipper — finds the main content and drops the rest. Typical
result: **280 KB of HTML becomes ~2,500 words of Markdown**, around 9% of the
original bytes, with the article intact.

Each `.md` carries frontmatter tying it back to its manifest entry:

```yaml
source_id: tooley-1979
title: Interview with Robert Fripp by Dick Tooley
author: Robert Fripp; Dick Tooley (interviewer)
url: "https://www.elephant-talk.com/wiki/..."
accessed: 2026-08-11
word_count: 4111
extracted_from: files/raw/tooley-1979.html
extracted_with: defuddle
```

`raw/` exists only so extraction can be re-run with better settings later. It is
an intermediate, not the archive.

## Why files/ is gitignored

Most of this is third-party copyrighted material. Keeping local copies for
research is ordinary scholarly practice; **committing them to a public
repository is republication**, which is what
[Rights and legal](../docs/architecture/rights-and-legal.md) exists to prevent. Tamm's book
is the clearest case — freely distributed by its author, and still not a 680 KB
mirror we should carry in git history.

The repository carries the **manifest and the scripts**; the archive is
reproducible from them.

## Usage

```sh
bun install                # playwright + defuddle + linkedom

./fetch.sh --all           # curl → browser → extract.  The usual command.

./fetch.sh                 # curl pass only
./fetch.sh --browser       # browser pass only
node extract.mjs           # re-extract from existing raw/
./fetch.sh --verify        # check disk against the manifest (exit 1 on problems)
./fetch.sh --check         # liveness of every URL, fetch nothing
./fetch.sh tooley-1979 ... # specific ids; combines with a mode flag
```

The curl path needs only `bash`, `curl`, `awk`, so it works before the project
has a `node_modules`. The browser and extract paths need Node.

### The browser path

`fetch-browser.mjs` handles what curl cannot: interstitials that clear only
after JS runs, and JS-rendered shells that return nothing to a non-browser
client.

- **Prefers real Chrome** over bundled Chromium — Cloudflare fingerprints
  headless Chromium and sits on it. Falls back where Chrome is absent.
- **Persistent profile** (`.browser-profile/`, gitignored) so a clearance
  cookie survives between runs.
- **Escalates to headful automatically** when a challenge won't clear headless.
  A window opens; leave it alone. `TM_HEADFUL=1` to start there,
  `TM_NO_ESCALATE=1` never to.

It waits a challenge out the way a person's browser does. No CAPTCHA solving,
no login bypass, no rate-limit evasion — anything needing that stays `manual`.

## Status, as of 11 August 2026

**41 tracked · 32 archived and extracted · 9 not collectible by script.**

`./fetch.sh --verify` reports live numbers; the manifest deliberately carries no
hand-maintained counts.

| `fetch.status` | Count | Meaning |
|---|---|---|
| `ok` | 28 | curl fetches it |
| `browser` | 4 | needs `fetch-browser.mjs`, still fully reproducible |
| `manual` | 7 | cannot be fetched by a script by nature |
| `blocked` | 1 | live URL that defeats automation |
| `skipped` | 1 | our own library; read from the local checkout |

Nothing is dropped for being inconvenient. Every source is in `sources.yaml`
whether or not we can fetch it, so the gaps are a **known list** rather than a
silent absence.

### Needs a human — download these by hand

Drop the file at `files/raw/<id>.html` and re-run `node extract.mjs`.

| id | What to get | Where | Blocks |
|---|---|---|---|
| `michigan-daily-1979` | Save the page, or use its **Download Text** button, from an ordinary browser | [digital.bentley.umich.edu](https://digital.bentley.umich.edu/midaily/mdp.39015071754555/519) — a Cloudflare managed challenge beat curl, headless Chromium, headless Chrome, headful Chrome with a persistent profile, and the `download_text` endpoint | ch. 3.2 |
| `eno-discreet-music-sleeve` | The liner drawing — sleeve or a good scan | physical record | **ch. 1** — the hero diagram descends from it |
| `fripp-guitar-circle-2022` | The book | ordered from DGM Live | revises ch. 8–10 |
| `dublin-keynote-2025` | Seven video IDs, then a transcript | YouTube, uncaptioned | ch. 7, 8, Part IV |
| `midnight-special-1979` | A stable copy of the ~4 min clip | circulates via Dangerous Minds / Synthtopia | ch. 1, Part IV |
| `gaskin-1979` | Full interview text | never located; try Elephant Talk's wider archive and 1979 fanzine scans | ch. 1 |
| `gc-monograph-3` | An image, **reference only** — never reproduced | out-of-print 1987 poster | ch. 3.2 |
| `bruford-and-the-beat` | Nothing — cite and link only, do not rehost | [YouTube](https://www.youtube.com/watch?v=7BiYQt5cLgU) | ch. 8 |
| `quiver-browser-integration` | Nothing — read the local checkout | `libraries/quiver/docs/` | spec 03 |

The last two need no action: they are listed because the manifest tracks
everything, not because anything is missing.

## Rules

1. **A source on the site is a source in `sources.yaml`.** No exceptions. The
   prose companion is [the bibliography](../docs/architecture/bibliography.md); this is
   the data, and `/sources` is generated from it.
2. **A 200 is not an archive.** The fetcher rejects bot-check pages, `404`
   bodies and suspiciously small files; the extractor flags thin results. Both
   have already caught real failures.
3. **No hand-written files in `files/`.** They rot and cannot be regenerated. If
   a source can only be read by hand, quote it into
   [the bibliography](../docs/architecture/bibliography.md) with a date, and leave the
   manifest entry marked as needing collection.
4. **`accessed` dates are real.** Update them when re-fetching, not when editing.
5. **Never commit `files/`.**
6. **Record what fails.** Removing an uncollectable source would lose the fact
   that we need it.

## Verification history

| Date | What |
|---|---|
| 2026-08-11 | First pass. 41 tracked, 29 archived by curl. Found three link-rot errors in the source briefs — including one in the other direction, where a page both briefs assumed dead is live at a different path. |
| 2026-08-11 | Browser pass added; cleared the Substack, Robertson, Rāga Junglism and DGM Live. |
| 2026-08-11 | Defuddle extraction added. Caught `lamont-1` as a saved **error page** — 75 KB of error-graphic SVG that had passed every byte-count check since the first fetch. Refetched: 1,173 words. |
