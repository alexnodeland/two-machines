# Planning

The specification for **Two Machines**. Nothing gets built that is not decided here first.

*Started 11 August 2026. Supersedes nothing — this is the first planning pass.*

---

## How to read this

Documents are numbered by dependency, not by importance. `01` constrains `02`,
which constrains everything after it. If two documents disagree, the lower number
wins and the higher one is a bug.

| | Document | What it settles |
|---|---|---|
| — | [Decision log](00-decision-log.md) | Every binding decision, numbered, with its reasoning and its reversal cost |
| 01 | [Thesis and scope](01-thesis-and-scope.md) | What the argument is, what is in, what is deliberately out |
| 02 | [Information architecture](02-information-architecture.md) | Every page, its URL, its size budget, its interactive |
| 03 | [Audio engine](03-audio-engine-spec.md) | Signal path, parameters, scheduling, the DSP contract |
| 04 | [Cycles engine](04-cycles-engine-spec.md) | The second engine: model, modes, views, presets |
| 05 | [Design system](05-design-system.md) | Tokens, type, the colour semantics, the size ladder, the spine |
| 06 | [Accessibility and interaction](06-accessibility-and-interaction.md) | Keyboard, motion, audio consent, the no-microphone floor |
| 07 | [Tech stack](07-tech-stack.md) | Gatsby, Bun, TypeScript, MDX — and the known sharp edges |
| 08 | [Testing strategy](08-testing-strategy.md) | How 100% coverage is achieved honestly rather than nominally |
| 09 | [CI/CD](09-ci-cd.md) | Workflows, caching, deployment, the failure modes already learned |
| 10 | [Content methodology](10-content-methodology.md) | Voice, citation discipline, the chapter template, editorial marking |
| 11 | [Rights and legal](11-rights-and-legal.md) | The full posture, and what it forbids us from building |
| 12 | [References](12-references.md) | Master bibliography. Every source, with liveness checked and dated |
| 13 | [Roadmap](13-roadmap.md) | Build order, milestones, definition of done |
| 14 | [Open questions](14-open-questions.md) | What is genuinely undecided, and what would resolve each |

## Source briefs

Two briefs from the client precede this directory and remain authoritative on
research content:

- **v1** — the research corpus. Part 1 (the primary-source survey) stands unchanged
  and is the factual basis for the Machine half.
- **v2** — the revision. Reframes the subject around the two-cycles thesis, adds the
  Discipline half, and adds three rights constraints.

Where this specification departs from a brief, the departure is recorded as a numbered
decision in [00-decision-log.md](00-decision-log.md) with its reasoning. There are
currently four such departures (D-002, D-011, D-014, D-021).

## Status

All 15 documents drafted. 41 decisions recorded, 3 blocking questions open.

| Area | State |
|---|---|
| Thesis and scope | **Decided.** Website, no book. One launch. |
| Information architecture | **Decided.** Chapter detail pending the next pass. |
| Audio engine | **Decided.** quiver in an AudioWorklet; blocked on three upstream gaps. |
| Cycles engine | **Decided**, validated in prototype |
| Design system | **Decided.** One open question — the mobile L. |
| Accessibility | **Decided.** One known gap — canvas semantics. |
| Tech stack | **Decided.** `pathPrefix` required. |
| Testing | **Decided.** Three tiers; `all: true`. |
| CI/CD | **Decided** |
| Content methodology | **Decided.** Chapters not yet drafted. |
| Rights | **Decided.** DGM approach now optional, not required. |
| References | **Verified 11 Aug 2026.** Two corrections to brief v1 found. |

### What the research pass changed

- **Tamm is in hand** — full text, Internet Archive, opensource. The *Sacred Songs*
  claim is verified verbatim, and it rests on him alone.
- **Two factual errors in brief v1** were found and corrected. The Kitchen date is
  February 1978, not May 1977. See [12 §0](12-references.md#0-corrections-to-the-briefs).
- **The Loopers Delight page is not dead** — both briefs assume it is. It is live at a
  different path.
- **Only one purchase is required**: *The Guitar Circle*. It gates three chapters.
- **Three concrete gaps in quiver** were found by reading its source, and are now
  D-038/039/040.

## Conventions

- Internal links use relative paths and GitHub-style anchors. A checker script lives in
  the roadmap's Phase 0; **links were verified on 11 Aug 2026**.
- Decisions are referenced by number (`D-017`), never by restating them. If a decision
  needs restating, the document is drifting from the log.

The next pass is **chapter by chapter**: each page in
[02-information-architecture.md](02-information-architecture.md) gets its own document
in `planning/chapters/`, following the template in
[10 §3](10-content-methodology.md#3-chapter-template).

## Prototypes

`../mockups/` holds working prototypes that predate this directory. They are
**evidence, not specification** — where a mockup and a document disagree, the document
is correct and the mockup is stale. Their value is that the load-bearing claims in
`03` and `04` were played before they were written down.
