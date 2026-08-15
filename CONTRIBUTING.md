# Contributing

Two Machines is a live site with a full application behind it. This document covers
the tools you need, the day-to-day loop, the gate every change passes, and the
standing rules that are easy to break.

## Prerequisites

- **[Bun](https://bun.sh)** — the package manager and script runner.
- **Node ≥ 18** — Gatsby's floor.
- **[just](https://github.com/casey/just)** (`brew install just`) — a hard
  prerequisite, not a convenience: the pre-push hook runs `just check`.
- **Playwright's Chromium** — `bunx playwright install chromium`, needed for e2e.
- **python3** — used to validate the source manifest after edits (see traps, below).

`just setup` runs the installs in one step: `bun install`, the Playwright browser,
and the separate `bun install` inside `references/` (the reference tooling has its
own dependencies).

## The day-to-day loop

```sh
just dev        # dev server (unprefixed, hot reload)
just test       # vitest, single run
just check      # before pushing — the pre-push hook runs this for you
just gate       # before opening a PR — full CI parity
```

E2e never runs against the dev server. It runs against the built, prefixed output:
`just build` first, then `just e2e` (or one spec: `just e2e-file e2e/rig.spec.ts`).
Several failure modes — the path prefix, worklet and wasm URLs — only exist in the
built output.

## The gate

`just gate` is what CI runs, itemized:

1. **Generated-sources drift** — regenerate `src/data/sources.generated.ts` and fail
   if it differs from what's committed.
2. **Typecheck** — `tsc --noEmit`, strict.
3. **Lint** — eslint, including the fences that keep `src/audio/` pure (ADR-027).
4. **Format** — prettier check.
5. **Coverage** — vitest at 100%, `all: true`. There is no soft mode.
6. **Build** — a prefixed production build.
7. **Smoke** — `scripts/smoke.sh` against the built output.
8. **E2e** — Playwright serves `public/` on **:9000** and runs the full suite,
   including axe, mobile, and compliance sweeps.

A stale process on :9000 serves a stale build silently — if e2e results make no
sense, `just kill-server` and rebuild. `just rebuild` (`gatsby clean` + build) is
the honest way to re-judge any dependency, CSS, or content fix.

## PR discipline

`main` is protected — nothing lands on it directly. Every change goes up as a PR
with the full gate green; deploy runs automatically on merge. After a merge, wait
out the deploy workflow and verify the live page before calling the change done.

## The documentation pipeline

This repo follows the [Principled](https://github.com/alexnodeland/principled)
specification-first methodology. All specification lives in [`docs/`](docs/README.md):

1. **Propose** — substantive changes of direction start as an RFC in `docs/proposals/`
   (`draft` → `in-review` → `accepted`).
2. **Decide** — an accepted proposal yields one or more ADRs in `docs/decisions/`.
   Accepted ADRs are **immutable**; to reverse one, write a superseding ADR.
3. **Plan** — implementation work is tracked in `docs/plans/`, linked to its
   originating proposal.
4. **Document** — `docs/architecture/` describes the current design and is kept up to
   date as decisions land.

With the principled plugins enabled (they are, via `.claude/settings.json`), use
`/new-proposal`, `/new-adr`, `/new-plan`, and `/validate`. Numbered documents are named
`NNN-short-slug.md`; the next number is always `max + 1`, and gaps are never backfilled.

## Standing rules

These are binding constraints, not style preferences — each is an ADR:

- **No hosted audio, ever** (ADR-032). The sound is synthesized in the reader's
  browser or it doesn't exist.
- **Meters only for King Crimson** — cycle length and downbeat; never a pattern,
  never tab (ADR-017, ADR-031).
- **The aphorism cap is four, site-wide**, each attributed (ADR-030).
- **Editorial claims wear a visible mark and never carry a citation** — a footnote
  on our own analysis launders opinion into apparent fact (ADR-003).
- **`references/files/` is never committed** (ADR-045). Copyrighted material; only
  the manifest and scripts live in git. The archive is rebuilt with
  `cd references && ./fetch.sh`.
- **`longestInterlock` (17) is what the UI prints**, not `longestGap` (18). Two
  pages quote this number (ADR-018).

## Traps

Each of these has bitten once already:

- **Every asset URL goes through `withPrefix`** (ADR-029, ADR-037). The site ships
  at the `/two-machines` path prefix; a bare worklet or wasm URL works in dev and
  dies silently in production.
- **Prettier corrupts `{/* */}` comments in MDX bodies.** Revision markers live in
  chapter frontmatter `todos:`, never in the body.
- **`gatsby clean` before judging any dependency, CSS, or content fix.** The stale
  `.cache` trap has bitten three separate times; `just rebuild` exists for this.
- **After editing `references/sources.yaml`, validate it** — the fetch script's
  parser is more forgiving than a real one:
  `python3 -c "import yaml; yaml.safe_load(open('references/sources.yaml'))"`
- **No hand-written files in `references/files/`.** They rot. A source only readable
  by hand gets quoted into the
  [bibliography](docs/architecture/bibliography.md) with a date instead.
- **No hand-maintained counts** — of sources, ADRs, anything. They drift within the
  hour; link the manifest or the index and let it speak for itself.

## Writing conventions

- Internal links are relative, with GitHub-style anchors. Check them before committing.
- Reference decisions by number (`ADR-017`), never by restating them.

## Commits

Small, scoped commits with imperative subjects. No attribution trailers — no
generated-with lines, no co-author credits for tools.
