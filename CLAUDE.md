# Two Machines — AI development context

A website that teaches tape-delay looping (the technique Fripp named Frippertronics) by
letting the reader play every concept in the page. **No application code exists yet,
deliberately** — the specification is settled before code is written.

## Where everything is

```
docs/            the specification — the Principled pipeline (start at docs/README.md)
  proposals/     RFCs. RFC-001 is the thesis and scope.
  decisions/     42 ADRs. Immutable once accepted; supersede, never edit.
  plans/         Plan-001 is the build roadmap and the current state of work.
  architecture/  living design docs: engines, design system, testing, rights, bibliography
references/      41 tracked sources, the manifest, and the scripts that rebuild the archive
mockups/         working prototypes. EVIDENCE, NOT FOUNDATION — see below
```

Read [`docs/README.md`](docs/README.md) first, then
[RFC-001](docs/proposals/001-two-machines-website.md) and the
[decision index](docs/decisions/README.md). `D-NNN` anywhere in the corpus means
`ADR-NNN` in `docs/decisions/`.

## Methodology

This repo uses the [Principled](https://github.com/alexnodeland/principled)
specification-first plugins (enabled in `.claude/settings.json`). The pipeline is
**RFC → ADR → plan → architecture**. Consequences:

- **Accepted ADRs and accepted RFCs are immutable.** To change a decision, write a new
  ADR that supersedes the old one. Hooks enforce this.
- New proposals/plans/decisions get the next sequence number (`NNN-slug.md`) and the
  required frontmatter; use the plugin skills (`/new-proposal`, `/new-adr`, `/new-plan`,
  `/scaffold`, `/validate`).
- Architecture docs are living documents — keep `last_updated` and `related_adrs`
  current when editing them.

## Standing rules that are easy to break

- **`references/files/` is never committed.** Copyrighted material; only the manifest
  and scripts live in git (ADR-045).
- **No hand-written files in `references/files/`.** They rot. A source only readable by
  hand gets quoted into the [bibliography](docs/architecture/bibliography.md) with a
  date instead.
- **Editorial claims wear a visible mark and never carry a citation.** A footnote on our
  own analysis launders opinion into apparent fact (ADR-003).
- **Meters only for King Crimson.** Cycle length and downbeat; never a pattern, never
  tab (ADR-017, ADR-031).
- **Aphorism cap is four, site-wide** (ADR-030). No hosted audio, ever (ADR-032).
- **`longestInterlock` (17) is what the UI prints**, not `longestGap` (18). Two pages
  quote this number (ADR-018).
- **`pathPrefix` is required** — the site ships at `alexnodeland.github.io/two-machines`.
  Worklet and wasm URLs must go through `withPrefix` or audio dies silently in
  production (ADR-029, ADR-037).

## Mistakes already made once — don't repeat them

- `pathPrefix` was written backwards on the first pass (assumed custom domain).
- Hand-maintained counts in `sources.yaml` drifted within an hour. Deleted;
  `./fetch.sh --verify` reports live totals. Don't reintroduce them.
- The fetch script's YAML parser is more forgiving than a real one. After editing the
  manifest, validate:
  `python3 -c "import yaml; yaml.safe_load(open('references/sources.yaml'))"`
- A 75 KB saved **error page** passed every byte-count check. Word count caught it.
  Size is not an integrity check.

## About the mockups

`cd mockups && python3 -m http.server 8742` — five prototypes plus the client's original
five-against-seven page. They are **evidence**: the load-bearing claims in the engine
specs were *played* before they were written down. Where a mockup and a document
disagree, **the document is right and the mockup is stale.**

`mockups/engine.js` is superseded by quiver (ADR-035) but survives as the behavioural
oracle (ADR-041): a 0.9 s note at 0.85 feedback is still audible 2.6 s later, and the
quiver patch has to reproduce that.

## Current state of work

See [Plan-001](docs/plans/001-build-and-launch.md). Phase 0 highlights: the per-chapter
planning pass (start with Part I — writing the thesis chapter is the real test of the
argument), the three upstream quiver issues (ADR-038/039/040), and the hand-collection
of sources a script can't reach (`references/collect.html`).

Three blocking [open questions](docs/architecture/open-questions.md): Q-02 (the
*Discreet Music* diagram), Q-03 (a third independent *Discipline* meter source), Q-07
(whether the circular loop face survives).
