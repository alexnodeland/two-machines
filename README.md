# Two Machines

A guide to tape-delay looping — the technique Fripp named Frippertronics — taught by
letting you play it in the page.

Working title. "Frippertronics" is Fripp's coined term, used descriptively inside the
site rather than as the brand.

**Status: specification complete, no application code yet.** Deliberate — the plan is
settled before more code is written.

| | |
|---|---|
| **The specification** | [`docs/`](docs/README.md) — the Principled pipeline: 1 RFC, 42 ADRs, 1 plan, 12 architecture docs |
| **Current work** | [`docs/plans/001-build-and-launch.md`](docs/plans/001-build-and-launch.md) |
| **Sources** | [`references/`](references/README.md) — 41 tracked, 32 archived |
| **Collect by hand** | [`references/collect.html`](references/collect.html) — 7 sources a script can't reach |
| **Prototypes** | [`mockups/`](mockups/) — evidence, not foundation |

---

## The thesis

> The recurring object across Fripp's music is **two cycles of incommensurate length,
> and what happens when they realign.**

A tape delay is a fixed cycle running against your phrase length. Fripp's 15/16 runs
against Belew's 14/16. A room counts five claps against seven.

That framing is **ours, not Fripp's**, and everywhere the site asserts it, it wears a
visible mark saying so. The work splits into two halves joined by it: **The Machine**
(the rig, the lineage, what the tape does to your music, the grammar) and **The
Discipline** (where the numbers come from, the interlock, the tuning, the line).

The differentiator, stated plainly: every existing Frippertronics resource is either a
history article or a gear thread. The technique is a feedback system, the browser can
run feedback systems, so **every concept on the site should be playable in the page.**

## Layout

```
docs/         the specification. Read docs/README.md, then RFC-001 and the ADR index.
references/   41 sources, the manifest, and the scripts that rebuild the archive
mockups/      working prototypes from before the spec existed
```

The specification follows the
[Principled](https://github.com/alexnodeland/principled) methodology — proposals
(RFCs), immutable decision records (ADRs), plans, and living architecture docs — with
the principled plugins enabled for Claude Code via `.claude/settings.json`.

Nothing here is duplicated between directories on purpose. Where a mockup and a
specification document disagree, **the document is right and the mockup is stale.**

## The prototypes

```sh
cd mockups && python3 -m http.server 8742
```

Five instruments plus the original five-against-seven page. They exist as evidence: the
load-bearing claims in the engine specs were *played* before they were written down —
the two-pedal split, saturation making unity musical, the drift/offset distinction, the
LCM grid coming home at 210.

`mockups/engine.js` is superseded by quiver but survives as the numeric oracle the new
engine has to match.

## Stack

Gatsby 5 · TypeScript strict · Bun · Vitest at 100% · MDX · quiver via WebAssembly in an
AudioWorklet · GitHub Pages at `alexnodeland.github.io/two-machines`.

Rationale and sharp edges in
[`docs/architecture/tech-stack.md`](docs/architecture/tech-stack.md).

## Rights posture

No hosted audio. No aphorism collection — four, site-wide, each attributed. No King
Crimson transcriptions; meters only. Non-commercial. Unaffiliated, stated plainly.

These are constraints on what gets built, not disclaimers bolted on afterwards. See
[`docs/architecture/rights-and-legal.md`](docs/architecture/rights-and-legal.md).

## Licence

Code MIT · prose and research CC BY-NC-SA 4.0. Quoted material remains the property of
its rights holders and is not relicensed by either.

Unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar Craft.
