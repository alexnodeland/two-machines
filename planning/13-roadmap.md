# 13 · Roadmap

Build order, milestones, definition of done.

**One launch, not a staged release** (client decision, 11 Aug 2026). Everything ships
together.

---

## 1. The critical path

The longest chain is **not** engineering, and after the 11 August research pass it is no
longer source procurement either. Three of the four Tier 1 sources are in hand. The
fourth — *The Guitar Circle* — is **ordered from DGM but will take time to arrive**, and
client decision is to **write chapters 8–10 without it now and revisit when it lands**.

So the critical path is simply:

```
quiver gaps ──► engines ──► prose ──► harden ──► launch
                              ▲
                   The Guitar Circle arrives ──► revise ch. 8, 9, 10
```

The book is a **revision input, not a blocker**. That has a cost worth naming: chapters
8–10 will be drafted from Robertson, Tamm's Guitar Craft chapters and published
interviews, then **re-read against the authorised text**. Claims that turn out to rest on
weaker sources get corrected or hedged at that point.

**Chapters 8–10 must therefore be written so that a later correction is cheap** — claims
attributed inline rather than woven in, and a `TODO(guitar-circle)` marker on every
assertion that the book could confirm, sharpen or overturn. A grep for that marker is the
revision checklist.

### Source status after the 11 Aug research pass

| Source | Status | Blocks |
|---|---|---|
| **Tamm (1990)** | ✅ **obtained** — full text, Internet Archive, opensource | ch. 2, 5 |
| **Robertson (2017)** | ✅ open access (403 to bots; fine in a browser) | ch. 7 |
| **Bruford and the Beat** | ✅ on YouTube; Discipline segments muted, explanation intact | ch. 8 |
| **Fripp, *The Guitar Circle*** | 🛒 **ordered from DGM**, delivery pending. Not a blocker — chapters drafted without it and revised on arrival. ISBN 9781916153011 | revises ch. 8, 9, 10 |
| Dublin keynote 2025 | ⚠️ needs transcription (7 parts, uncaptioned) | ch. 7, 8, Part IV |
| *Discreet Music* sleeve | ⚠️ needed for the hero diagram | ch. 1 |
| Ron Gaskin interview | ⚠️ full text not located | ch. 1 |
| Third *Discipline* meter source | ⚠️ not found | ch. 8 |

**Only one purchase was required, and it is ordered.** Everything else was obtained free
and legitimately during the 11 August research pass.

The four ⚠️ rows are the remaining research work. None of them blocks starting; each
blocks *finishing* the chapter beside it.

---

## 2. Phases

Phases overlap. The ordering within each is what matters.

### Phase 0 · Unblock — *now*

- [x] ***The Guitar Circle*** ordered from DGM — arrives later, revision input
- [ ] Transcribe the Dublin keynote
- [ ] Source the *Discreet Music* sleeve
- [ ] Open quiver issues for [D-038](00-decision-log.md#d-038--quiver-gap-1--delayline-needs-a-longer-maximum--firm), [D-039](00-decision-log.md#d-039--quiver-gap-2--opt-in-feedback-past-unity--firm), [D-040](00-decision-log.md#d-040--quiver-gap-3--a-linear-seconds-delay-time-input--firm)
- [ ] Per-chapter planning documents ([10 §3](10-content-methodology.md#3-chapter-template))

### Phase 1 · Quiver — *blocks all audio*

Upstream, in the quiver repo.

- [ ] Configurable `MAX_DELAY_SECS` (default unchanged at 2 s)
- [ ] Opt-in unclamped feedback, with `Saturator` in the loop
- [ ] Linear-seconds delay-time input, **preserving the 5 ms slew**
- [ ] Verify the pitch glide survives
- [ ] npm release pipeline for `@quiver-dsp/wasm` with prebuilt wasm
- [ ] Publish `0.3.0`

**Exit:** the site can `bun add @quiver-dsp/wasm` and get an 8-second delay that
self-oscillates safely.

### Phase 2 · Scaffold

- [ ] Gatsby 5 + TS strict + Bun, `trustedDependencies` correct
- [ ] `pathPrefix` and `--prefix-paths`, verified in a built artifact
- [ ] Vitest with `all: true` and 100% thresholds, **enforced from the first commit**
- [ ] `justfile`, ESLint (incl. the three guard rules in [07 §9](07-tech-stack.md#9-quality-tooling)), Prettier, husky
- [ ] Both workflows; deploy a placeholder page and confirm the prefix works end to end

**Exit:** an empty site is live at the real URL with green CI. Do this before writing
anything substantial — the prefix and worklet-URL problems are far cheaper to find now.

### Phase 3 · Engines

- [ ] `src/audio/math/**` ported from the prototypes, 100% covered — **first**, because
      it is pure and it is most of the coverage
- [ ] Tape rig as a quiver patch in an AudioWorklet
- [ ] Tier 3 harness; assert the behavioural contract against the oracle ([03 §8](03-audio-engine-spec.md#8-behavioural-contract))
- [ ] Cycles engine: transport, three views, presets
- [ ] Rig UI: bench, drag-to-distance, ruler, trace, presets as URL state
- [ ] Limiter ceiling verified at feedback 1.18

**Exit:** both L's work, keyboard-operable, no microphone needed, contract tests green.

### Phase 4 · Prose — the long pole

Written in the order in [10 §7](10-content-methodology.md#7-writing-order), not chapter
order: Part I → ch. 3 → ch. 1, 2, 4 → ch. 7–10 → ch. 5, 6 → Part IV → Part V + sources.

### Phase 5 · The remaining interactives

Smaller sizes, each attached to its chapter: three notes (S) · beeping/droning (M) ·
canon (M) · **not committing (S)** · mud (S) · swells (S) · sequence plan (M) ·
NST fretboards (M) · circulations (M) · the XS inline readout.

**"Not committing" is the priority.** v2 §1.3 argues it is the most important technical
detail on the site and it currently has no exercise.

### Phase 6 · Harden

- [ ] Full a11y pass: axe, keyboard, screen reader, reduced motion
- [ ] Resolve the mobile L question ([05 §8](05-design-system.md#the-mobile-l--resolved-a-scrollable-bench-at-fixed-scale))
- [ ] Self-host fonts; remove the CDN
- [ ] Performance: off-screen pause, lazy wasm
- [ ] Rights compliance checklist ([11 §8](11-rights-and-legal.md#8-compliance-checklist))
- [ ] Link check over every citation
- [ ] Contrast audit

### Phase 7 · Launch

- [ ] Colophon, licences, non-affiliation, contact
- [ ] Final read-through against the [10 §8](10-content-methodology.md#8-review-checklist) checklist per chapter
- [ ] Ship

---

## 3. Definition of done

The site is done when a musician can do the seven things in
[01 §6](01-thesis-and-scope.md#6-what-done-means).

Plus, mechanically:

- [ ] Coverage 100% on tiers 1–2, with `all: true`
- [ ] Tier 3 contract tests green against a pinned quiver version
- [ ] axe clean on every page
- [ ] Every instrument works with no mic and no guitar
- [ ] Every citation resolves
- [ ] Rights checklist clean
- [ ] Every editorial claim marked; no editorial claim footnoted
- [ ] The worklet and wasm resolve at the deployed prefix

---

## 4. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Quiver gaps take longer than expected** | medium | blocks all audio | The prototype Web Audio engine still works. If Phase 1 slips badly, ship on it and swap later — [D-035](00-decision-log.md#d-035--the-rig-is-a-quiver-patch-running-in-an-audioworklet--firm) is the only decision that would need revisiting. |
| **Worklet/wasm 404 in production** | **high** | audio silently dead | Phase 2 deploys a placeholder early *specifically* to find this. Smoke-tested in CI. |
| **100% coverage becomes theatre** | medium | false confidence | `all: true`; the anti-gaming rule; tier 3 outside the percentage. |
| ***The Guitar Circle* arrives late, and contradicts a drafted chapter** | medium | rework in 3 chapters | Draft with inline attribution and `TODO(guitar-circle)` markers so a correction is a grep, not a rewrite. |
| **No third *Discipline* meter source** | medium | one hedged claim | Hedge it explicitly; the engine models meters the user can edit regardless. |
| **Bun/Gatsby friction** | medium | slow start | `trustedDependencies` documented; drop the sharp plugins entirely. |
| **Scope creep in the Discipline half** | high | never ships | The size ladder is the mechanism. Anything over budget gets cut. |
| **DGM complaint** | low | content removal | [11](11-rights-and-legal.md) designed the constraints in from the start. |

The two worth watching are **worklet URLs** (high likelihood, silent failure) and **scope
creep** (high likelihood, fatal). Both have structural mitigations rather than good
intentions.
