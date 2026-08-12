# Documentation

The specification for **Two Machines**. Nothing gets built that is not decided here
first.

*Started 11 August 2026 as a flat planning directory; restructured into the
[Principled](https://github.com/alexnodeland/principled) specification-first pipeline on
the same day. Supersedes nothing — this is the first planning pass.*

---

## Structure

The pipeline runs **proposal → decision → plan → architecture**:

| Directory | Holds | Lifecycle |
|---|---|---|
| [`proposals/`](proposals/) | RFCs — what we intend and why | draft → in-review → accepted / rejected |
| [`decisions/`](decisions/README.md) | ADRs — every binding decision | immutable once accepted; supersede, never edit |
| [`plans/`](plans/) | Implementation plans for accepted proposals | active → complete |
| [`architecture/`](architecture/) | Living documentation of the current design | mutable, kept current |

### The founding documents

- [RFC-001 · Two Machines — thesis and scope](proposals/001-two-machines-website.md) —
  the argument, the audiences, the scope boundaries, what "done" means. **Accepted.**
- [Plan-001 · Build and launch](plans/001-build-and-launch.md) — critical path, phases,
  definition of done, risks. **Active.**
- [The decision index](decisions/README.md) — 42 ADRs. The original `D-NNN` identifiers
  map one-to-one onto ADR numbers: `D-017` means
  [ADR-017](decisions/017-meters-never-parts.md).

### Architecture documents

| Document | What it settles |
|---|---|
| [Information architecture](architecture/information-architecture.md) | Every page, its URL, its size budget, its interactive |
| [Audio engine](architecture/audio-engine.md) | Signal path, parameters, scheduling, the DSP contract |
| [Cycles engine](architecture/cycles-engine.md) | The second engine: model, modes, views, presets |
| [Design system](architecture/design-system.md) | Tokens, type, the colour semantics, the size ladder, the spine |
| [Accessibility and interaction](architecture/accessibility-and-interaction.md) | Keyboard, motion, audio consent, the no-microphone floor |
| [Tech stack](architecture/tech-stack.md) | Gatsby, Bun, TypeScript, MDX — and the known sharp edges |
| [Testing strategy](architecture/testing-strategy.md) | How 100% coverage is achieved honestly rather than nominally |
| [CI/CD](architecture/ci-cd.md) | Workflows, caching, deployment, the failure modes already learned |
| [Content methodology](architecture/content-methodology.md) | Voice, citation discipline, the chapter template, editorial marking |
| [Rights and legal](architecture/rights-and-legal.md) | The full posture, and what it forbids us from building |
| [Bibliography](architecture/bibliography.md) | Master bibliography. Every source, with liveness checked and dated |
| [Open questions](architecture/open-questions.md) | What is genuinely undecided, and what would resolve each |

## Source briefs

Two briefs from the client precede this directory and remain authoritative on research
content:

- **v1** — the research corpus. Part 1 (the primary-source survey) stands unchanged and
  is the factual basis for the Machine half.
- **v2** — the revision. Reframes the subject around the two-cycles thesis, adds the
  Discipline half, and adds three rights constraints.

Where this specification departs from a brief, the departure is recorded as an ADR with
its reasoning. There are currently four such departures (ADR-002, ADR-011, ADR-014,
ADR-021).

## Status

All documents drafted. 42 decisions recorded. **No blocking research questions remain**
— Q-02 and Q-03 both resolved 11 Aug 2026.

| Area | State |
|---|---|
| Thesis and scope | **Accepted** (RFC-001). Website, no book. One launch. |
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
| Bibliography | **Verified 11 Aug 2026.** Two corrections to brief v1 found. |

### What the research pass changed

- **Tamm is in hand** — full text, Internet Archive, opensource. The *Sacred Songs*
  claim is verified verbatim, and it rests on him alone.
- **Two factual errors in brief v1** were found and corrected. The Kitchen date is
  February 1978, not May 1977. See
  [Bibliography §0](architecture/bibliography.md#0-corrections-to-the-briefs).
- **The Loopers Delight page is not dead** — both briefs assume it is. It is live at a
  different path.
- **Only one purchase is required**: *The Guitar Circle*. It gates three chapters.
- **Three concrete gaps in quiver** were found by reading its source, and are now
  ADR-038/039/040.

## Conventions

- Internal links use relative paths and GitHub-style anchors; **links were verified on
  11 Aug 2026** and re-verified after the restructure.
- Decisions are referenced by number (`D-017` / `ADR-017`), never by restating them. If
  a decision needs restating, the document is drifting from the record.
- Documents follow the [Principled](https://github.com/alexnodeland/principled)
  methodology; the plugins enabled in [`.claude/settings.json`](../.claude/settings.json)
  enforce frontmatter, lifecycle transitions, and ADR immutability.

The next pass is **chapter by chapter**: each page in
[Information architecture](architecture/information-architecture.md) gets its own
document in `docs/chapters/`, following the template in
[Content methodology §3](architecture/content-methodology.md#3-chapter-template).

## Prototypes

[`../mockups/`](../mockups/) holds working prototypes that predate this directory. They
are **evidence, not specification** — where a mockup and a document disagree, the
document is correct and the mockup is stale. Their value is that the load-bearing claims
in the [Audio engine](architecture/audio-engine.md) and
[Cycles engine](architecture/cycles-engine.md) docs were played before they were written
down.
