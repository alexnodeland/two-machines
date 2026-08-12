# Decisions

Every binding decision, one ADR per file, numbered `001`–`046` (gaps `006`–`009` are
unused; numbers are never reused). These were imported from the planning-pass decision
log on 2026-08-11 — the original `D-NNN` identifiers map one-to-one onto ADR numbers, so a
reference like `D-017` anywhere in the corpus means [ADR-017](017-meters-never-parts.md).

A decision is not a preference — if it can be changed on a whim it belongs in an
architecture document, not here. All imported ADRs are `accepted` and therefore
**immutable**; to change one, write a new ADR that supersedes it.

Firmness at import time is recorded in each ADR's Status section: `firm` (reversing is
expensive or invalidates work) · `soft` (reversible cheaply) · `provisional` (decided so
work can proceed). All 42 imported decisions were `firm`.

## Product and argument

| ADR | Decision |
|---|---|
| [ADR-001](001-two-cycles-thesis.md) | The site is organised around the two-cycles thesis |
| [ADR-002](002-website-not-book.md) | This is a website. There is no book |
| [ADR-003](003-editorial-claims-marked.md) | Editorial claims are visibly marked in the UI |
| [ADR-004](004-descriptive-title.md) | Descriptive title, coined term used inside |
| [ADR-005](005-non-hagiographic-lineage.md) | Non-hagiographic lineage is a launch requirement, not a nicety |

## Engines

| ADR | Decision |
|---|---|
| [ADR-010](010-delay-as-physical-distance.md) | Delay time is set as a physical distance |
| [ADR-011](011-constant-px-cm-scale.md) | Pixels map to centimetres at a constant scale |
| [ADR-012](012-separate-monitor-and-record-head.md) | Monitor and record head are separate nodes from the first commit |
| [ADR-013](013-saturation-on-feedback-path.md) | Saturation sits on the feedback path |
| [ADR-014](014-ramped-delay-pitch-glide.md) | Delay time is ramped, and the pitch glide is kept |
| [ADR-015](015-one-audiocontext.md) | One `AudioContext` for the entire site |
| [ADR-016](016-offset-and-drift-separate-modes.md) | Offset and drift are separate modes, and the grid is disabled in drift |
| [ADR-017](017-meters-never-parts.md) | The Cycles engine models meters, never parts |
| [ADR-018](018-longest-interlock-printed.md) | `longestInterlock` is the number we print |
| [ADR-019](019-lookahead-scheduling.md) | Lookahead scheduling, not `setInterval` alone |

## Design

| ADR | Decision |
|---|---|
| [ADR-020](020-semantic-colour.md) | Colour is semantic, not decorative |
| [ADR-021](021-size-ladder-budget.md) | The size ladder is a budget, and there are two L's |
| [ADR-022](022-the-spine.md) | One page-level effect: the spine |
| [ADR-023](023-not-beige-tape-nostalgia.md) | Not beige tape nostalgia |
| [ADR-042](042-mobile-rig-scrollable-bench.md) | The mobile Rig is a scrollable bench at fixed scale |
| [ADR-043](043-canvas-generated-descriptions.md) | Canvas accessibility is solved by generated descriptions, not SVG |
| [ADR-044](044-law-of-seven-acoustic-fact.md) | Chapter 7's interactive demonstrates the acoustic fact and reports the doctrine |

## Engineering

| ADR | Decision |
|---|---|
| [ADR-024](024-gatsby-typescript-strict.md) | Gatsby 5 + TypeScript strict |
| [ADR-025](025-bun-package-manager-node-runtime.md) | Bun is the package manager and script runner; Node is the runtime |
| [ADR-026](026-vitest-100-all-true.md) | Vitest, with 100% thresholds and `all: true` |
| [ADR-027](027-pure-from-wiring-split.md) | Engines are split pure-from-wiring |
| [ADR-028](028-three-tier-testing.md) | jsdom cannot test Web Audio; three-tier strategy instead |
| [ADR-029](029-github-pages-pathprefix.md) | GitHub Pages project page, therefore `pathPrefix` IS required |

## Quiver

*Client decision, 11 Aug 2026: the DSP comes from `quiver`, the client's own Rust audio-synthesis library, rather than from hand-built Web Audio nodes. The site remains fully TypeScript; quiver arrives as compiled WebAssembly.*

| ADR | Decision |
|---|---|
| [ADR-035](035-quiver-patch-audioworklet.md) | The rig is a quiver patch running in an AudioWorklet |
| [ADR-036](036-quiver-wasm-npm-package.md) | `@quiver-dsp/wasm` is published to npm with prebuilt WebAssembly |
| [ADR-037](037-prefix-aware-worklet-wasm-urls.md) | Worklet and wasm URLs must be prefix-aware |
| [ADR-038](038-quiver-delayline-max-delay.md) | quiver gap 1 — `DelayLine` needs a longer maximum |
| [ADR-039](039-quiver-feedback-past-unity.md) | quiver gap 2 — opt-in feedback past unity |
| [ADR-040](040-quiver-linear-seconds-delay.md) | quiver gap 3 — a linear-seconds delay-time input |
| [ADR-041](041-prototype-as-behavioural-oracle.md) | The prototype engine becomes the behavioural oracle |

## Rights

| ADR | Decision |
|---|---|
| [ADR-030](030-no-aphorism-database.md) | No aphorism database, ever |
| [ADR-031](031-no-transcriptions-or-tab.md) | No King Crimson transcriptions or tab |
| [ADR-032](032-no-hosted-audio.md) | No hosted audio, none |
| [ADR-033](033-non-commercial.md) | Non-commercial |
| [ADR-034](034-cite-robertson-not-gurdjieff.md) | Cite Robertson rather than Gurdjieff directly |
| [ADR-045](045-reproducible-reference-archive.md) | The reference archive is reproducible, not committed |
| [ADR-046](046-unfetchable-sources-in-manifest.md) | Unfetchable sources stay in the manifest |

## Superseded

*None yet.*
