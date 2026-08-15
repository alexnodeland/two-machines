# Two Machines

A guide to tape-delay looping — the technique Fripp named Frippertronics — taught by
letting you play it in the page.

**Live at [alexnodeland.github.io/two-machines](https://alexnodeland.github.io/two-machines/).**

[![Test](https://github.com/alexnodeland/two-machines/actions/workflows/test.yml/badge.svg)](https://github.com/alexnodeland/two-machines/actions/workflows/test.yml)
[![Deploy](https://github.com/alexnodeland/two-machines/actions/workflows/deploy.yml/badge.svg)](https://github.com/alexnodeland/two-machines/actions/workflows/deploy.yml)
[![Code: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY-NC-SA 4.0](https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-lightgrey.svg)](LICENSE-CONTENT.md)

## What this is

The recurring object across Fripp's music is two cycles of incommensurate length, and
what happens when they realign — a tape delay is a fixed cycle running against your
phrase length, and that framing (ours, not Fripp's, and visibly marked as such wherever
the site asserts it) is the site's thesis. Every existing Frippertronics resource is a
history article or a gear thread; the technique is a feedback system, the browser can
run feedback systems, so every concept on the site is playable in the page — no hosted
audio anywhere, the sound is synthesized live in yours. The work splits into two halves
joined by the thesis: **The Machine** (the rig, the lineage, what the tape does to your
music, the grammar) and **The Discipline** (where the numbers come from, the interlock,
the tuning, the line).

## Quickstart

Prerequisites, one line: [Bun](https://bun.sh), Node ≥ 18, and
[just](https://github.com/casey/just) (`brew install just`).

```sh
bun install
just dev
```

That's a local dev server. The e2e suite needs two more things — Playwright's browser
(`bunx playwright install chromium`) and a build to run against (`just build`), because
e2e tests the built, prefixed output, not the dev server. `just setup` does the
installs in one step.

## The gate

```sh
just check   # what the pre-push hook runs: generated-sources drift, typecheck,
             # lint, format, 100% coverage
just gate    # full CI parity: check, then the prefixed build, smoke tests, and e2e
```

Every change lands via PR with the gate green. `just --list` shows everything else.

## Repo map

```
src/          Gatsby 5 + TypeScript strict. Chapters are MDX in src/content/;
              the instruments live in src/components/instruments/; the audio
              and math under src/audio/ are pure — no DOM, lint-fenced
e2e/          Playwright suites (axe, mobile, compliance, audio lifecycle) run
              against the BUILT prefixed output served on :9000
docs/         the specification — start at docs/README.md
references/   the source manifest and the scripts that rebuild the archive;
              the archive itself (references/files/) is never committed
mockups/      pre-spec prototypes. Evidence, not foundation: where a mockup
              and a document disagree, the document is right
scripts/      the build helpers: source generation, the quiver prebuild, smoke
```

## How it's built

Gatsby 5 · TypeScript strict · the quiver DSP engine compiled to WebAssembly and run
in an AudioWorklet (`@quiver-dsp/wasm` from npm) · GitHub Pages at the
`/two-machines` path prefix. That prefix is load-bearing: every worklet and wasm URL
goes through `withPrefix`, or audio dies silently in production. Rationale and sharp
edges in [`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md).

## The specification

Nothing here was built that was not decided first. The repo follows the
[Principled](https://github.com/alexnodeland/principled) pipeline — RFC → ADR → plan →
architecture: substantive direction starts as a proposal
([RFC-001](docs/proposals/001-two-machines-website.md) is the thesis and scope),
accepted proposals yield immutable decision records
([the ADR index](docs/decisions/README.md)), plans track the implementation, and the
living architecture docs describe the current design. The research corpus behind the
site is catalogued in [`references/sources.yaml`](references/sources.yaml) and
annotated in [the bibliography](docs/architecture/bibliography.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) — the day-to-day loop, the gate itemized, and
the standing rules that are easy to break.

## Rights posture

No hosted audio. No aphorism collection — four, site-wide, each attributed. No King
Crimson transcriptions; meters only. Non-commercial. Unaffiliated, stated plainly.

These are constraints on what gets built, not disclaimers bolted on afterwards. See
[`docs/architecture/rights-and-legal.md`](docs/architecture/rights-and-legal.md).

## Licence

Code MIT ([LICENSE](LICENSE)) · prose and research CC BY-NC-SA 4.0
([LICENSE-CONTENT.md](LICENSE-CONTENT.md)). Quoted material remains the property of
its rights holders and is not relicensed by either.

"Frippertronics" is Robert Fripp's coined term, used descriptively. This site is
unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar Craft.
