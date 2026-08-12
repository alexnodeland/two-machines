# Contributing

There is no application code yet — the current work is specification, research, and the
per-chapter planning pass. This document covers how to work on those; build/test/lint
conventions will be added when the Gatsby scaffold lands (Plan-001, Phase 2).

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

## Editorial and rights rules

These are binding constraints, not style preferences — each is an ADR:

- No hosted audio (ADR-032); no King Crimson transcriptions or tab (ADR-031); no
  aphorism collection — four quoted site-wide, maximum (ADR-030); non-commercial
  (ADR-033).
- Editorial claims are visibly marked and never footnoted (ADR-003).
- `references/files/` is never committed (ADR-045). The archive is rebuilt with
  `cd references && ./fetch.sh`.

## Writing conventions

- Internal links are relative, with GitHub-style anchors. Check them before committing.
- Reference decisions by number (`ADR-017`), never by restating them.
- After editing `references/sources.yaml`, validate it:
  `python3 -c "import yaml; yaml.safe_load(open('references/sources.yaml'))"`

## Commits

Small, scoped commits with imperative subjects. The specification is the product right
now — treat doc changes with the same care as code.
