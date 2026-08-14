---
title: "Build and launch"
number: 1
status: active
author: Alex Nodeland
created: 2026-08-11
updated: 2026-08-12
originating_proposal: 1
related_adrs: ["035", "038", "039", "040"]
---

# Plan-001: Build and launch

Implements [RFC-001](../proposals/001-two-machines-website.md). Build order, milestones, definition of done.

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
| *Discreet Music* sleeve | ✅ **resolved 11 Aug 2026** — the Are.na scan visually confirmed as the sleeve diagram; redrawn as `DiscreetSchematic` (Q-02) | ch. 1 |
| Ron Gaskin interview | ✅ **located 11 Aug 2026** — full text on Elephant Talk, Wayback-mirrored; provenance caveat recorded in [Bibliography §1](../architecture/bibliography.md#1-primary--fripps-own-words) | ch. 1 |
| Third *Discipline* meter source | ✅ **substantially resolved 11 Aug 2026** — Fripp 1981 (17, 15, verbatim) + DRUM! 2012 (17) independent; the 14 stays hedged (Q-03) | ch. 8 |

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
- [x] Open quiver issues for [D-038](../decisions/038-quiver-delayline-max-delay.md), [D-039](../decisions/039-quiver-feedback-past-unity.md), [D-040](../decisions/040-quiver-linear-seconds-delay.md) — [quiver#40](https://github.com/alexnodeland/quiver/issues/40), [quiver#41](https://github.com/alexnodeland/quiver/issues/41), [quiver#42](https://github.com/alexnodeland/quiver/issues/42)
- [x] Per-chapter planning documents ([Content methodology §3](../architecture/content-methodology.md#3-chapter-template)) — 16 documents in [`docs/chapters/`](../chapters/README.md), with the bibliography gaps they surfaced recorded in place

### Phase 1 · Quiver — *blocks all audio*

Upstream, in the quiver repo.

- [x] Configurable `MAX_DELAY_SECS` (default unchanged at 2 s) — [quiver#43](https://github.com/alexnodeland/quiver/pull/43)
- [x] Opt-in unclamped feedback, with saturation in the loop — quiver#43
- [x] Linear-seconds delay-time input, **preserving the 5 ms slew** — quiver#43
- [x] Verify the pitch glide survives — asserted by test (a time step glides through the one-pole smoother)
- [x] npm release pipeline for `@quiver-dsp/wasm` with prebuilt wasm — already existed (tag-driven, OIDC provenance)
- [ ] Publish `0.3.0` — **tagged; publish blocked on npm auth**: the account requires an
      interactive OTP (`EOTP`), which CI cannot supply. Fix on npmjs.com (trusted
      publishing for the three `@quiver-dsp` packages, or a granular automation token as
      `NPM_TOKEN`), then re-run the *Publish npm packages* workflow. A `0.3.1` should
      follow once [quiver#46](https://github.com/alexnodeland/quiver/pull/46) (the
      audio-rate input path, found at integration time) merges.

**Exit:** the site can `bun add @quiver-dsp/wasm` and get an 8-second delay that
self-oscillates safely.

### Phase 2 · Scaffold — **done, exit criterion met**

- [x] Gatsby 5 + TS strict + Bun, `trustedDependencies` correct (verified against real install warnings)
- [x] `pathPrefix` and `--prefix-paths`, verified in a built artifact (smoke script + e2e against the served prefixed build)
- [x] Vitest with `all: true` and 100% thresholds, **enforced from the first commit**
- [x] `justfile`, ESLint (the ADR-027 purity guard; the raw-href check lives in the smoke
      script; the one-AudioContext guard landed with the engines), Prettier, husky
- [x] Both workflows; placeholder deployed and the prefix confirmed end to end

**Exit met:** the site is live at
[alexnodeland.github.io/two-machines](https://alexnodeland.github.io/two-machines/)
with green CI (repo public, Pages enabled, 11 Aug 2026).

### Phase 3 · Engines — **exit criteria met, 11 Aug 2026**

- [x] `src/audio/math/**` ported from the prototypes, 100% covered — **first**, because
      it is pure and it is most of the coverage (curves + cycles, worked-values fixtures
      and the property tests)
- [x] Tape rig as a quiver patch in an AudioWorklet — live on the index page; the e2e
      presses the pad in Chromium and the real worklet boots (wasm at the prefix,
      `tape_delay` patch, `audio_in` fed by the tone pad). Interim: the package is a
      vendored 0.3.3 tarball until the npm token lands. Three integration bugs were
      found only in-browser and fixed upstream (quiver#49).
- [x] Tier 3 harness; behavioural contract asserted against the [§8 table](../architecture/audio-engine.md#8-behavioural-contract)
      on offline renders of the real patch (`e2e/contract.spec.ts`) — all eight rows
      hold. The audible-echo peak is logged against the oracle's ≈0.069; exact staging
      A/B against `mockups/engine.js` remains the §10 tuning task.
- [x] Cycles engine: transport, three views, presets — live at `/cycles`
- [x] Rig UI: bench ✅ drag-to-distance ✅ ruler ✅ presets as URL state ✅ ·
      trace + VU shipped 12 Aug 2026 (two AnalyserNode taps — into the machines,
      what the room hears — and the scrolling decay trace, runaway-red past
      unity, appearing only once audio is live)
- [x] Limiter ceiling verified at feedback 1.18 (`LIMITER_CEILING` 0.9, armed in the
      patch; the runaway render never exceeds it while self-oscillating underneath)

**Exit met:** both L's work on the live site, keyboard-operable, no microphone needed,
contract tests green (222 unit + 18 e2e, coverage 100% with `all: true`).

### Phase 4 · Prose — **complete, 12 Aug 2026**

Written in the order in [Content methodology §7](../architecture/content-methodology.md#7-writing-order), not chapter
order: Part I → ch. 3 → ch. 1, 2, 4 → ch. 7–10 → ch. 5, 6 → Part IV → Part V + sources.
All sixteen pages live: Part I, chapters 1–10, The Room, Listen, the generated
Sources, the colophon, and the Part 0 contents on the index.

### Phase 5 · The remaining interactives

Smaller sizes, each attached to its chapter: three notes (S) ✅ · beeping/droning (M) ✅
(also carries ch. 3.3 with the mud preset) · canon (M) ✅ · **not committing (S)** ✅ ·
mud (S) ✅ · swells (S) ✅ · sequence plan (M) ✅ · NST fretboards (M) ✅ ·
circulations (M) ✅ (Q-07 resolved 12 Aug 2026, dials view) · the XS inline readout ✅
(built per Q-11's default: it reflects the rig's persisted state to two decimals,
read-only, inside a chapter-1 sentence; whether it reads as decoration is judged in the
Phase 7 per-chapter review). **All ten shipped, 12 Aug 2026.**

**"Not committing" was the priority** (v2 §1.3: the most important technical detail on
the site) and shipped first: an AnalyserNode measures what returns, so the reader hears
and sees that nothing was committed.

### Phase 6 · Harden

- [x] a11y: axe (WCAG A/AA as e2e over all pages, zero-violation bar; found and
      fixed html-lang, default-blue links, dl semantics) · keyboard (every
      instrument keyboard-operable, asserted in tests) · reduced motion (spine
      rule per D-022). Manual screen-reader listen-through remains a Phase 7
      review item.
- [x] Mobile L executed: scrollable bench at fixed scale, 375 px e2e sweep, no
      page scrolls sideways (12 Aug 2026)
- [x] Self-hosted fonts; no CDN request (12 Aug 2026)
- [x] Performance: off-screen pause shipped 12 Aug 2026 (canvas paint loops
      gate on an IntersectionObserver ref; sound and scheduling never gate on
      visibility) · lazy wasm already held — audio loads only on gesture
- [x] Rights compliance checklist run 12 Aug 2026 — all pass; footer statement
      made site-wide and both licence files added during the run
      ([Rights and legal §8](../architecture/rights-and-legal.md#8-compliance-checklist))
- [x] Link check over every citation (28 URLs; two institutional bot-gates,
      reachable in a browser — recorded in the checklist run)
- [x] Contrast audit (axe color-contrast at AA over every page, in CI forever)

### Phase 7 · Launch — **complete, 12 Aug 2026**

- [x] Colophon, licences, non-affiliation, contact (compliance run, 12 Aug)
- [x] Final read-through against the [Content methodology §8](../architecture/content-methodology.md#8-review-checklist) checklist per chapter —
      run 12 Aug 2026 by three parallel reviewers over all sixteen pages. Findings
      (~25, all fixed the same day): the 14/16 asserted flatly in Part I (now
      hedged in place); uncited sleeve/venue/record claims across ch. 1, 2, 5
      (cited or rephrased); ch. 2's no-marks rule violated by its closing framing
      (neutralised); ch. 5 missing its page-level mark and printing the wrong
      Sacred Songs year (1980, per C-02); ch. 6's Max/Pd passages uncited (two
      technical manifest entries added) and its tape-tier claims cited to part 1
      instead of part 2 of Signs & Symptoms; ch. 7's thesis and one analytic
      sentence in our voice (reattributed to Robertson; the sentence cut, as the
      plan prescribes); Part IV's connective generalisations unmarked (marked);
      ch. 8's Reich contrast and circulation description uncited (cited); ch. 9
      missing its one-idea sentence and page-level mark (added); Part V missing
      its curriculum mark and carrying one unattributed quotation (marked;
      rephrased). The TODO(guitar-circle) markers now live in chapter frontmatter
      (`todos:`), where prettier cannot corrupt them and the arrival grep works.
      Judgments recorded: "small, mobile, intelligent unit" is a quoted Frippism
      cited to Tamm, not a Guitar Craft-corpus aphorism — the aphorism ledger
      stays at 0 of 4. The D-A-A-A fragment in ch. 10 is quotation of Tamm's
      published account, not transcription. Known deviations, accepted: ch. 5
      ships without the planned SignalPathModes diagram (post-launch candidate);
      the Michigan Daily passage awaits re-verification against the bot-gated
      original; the Part IV Tooley passage renders inline rather than as a
      blockquote.
- [x] **Shipped.** The site is live and complete at
      [alexnodeland.github.io/two-machines](https://alexnodeland.github.io/two-machines/),
      12 Aug 2026. Remaining work is revision-on-arrival (*The Guitar Circle*,
      the keynote transcription), the npm dependency swap when the token lands,
      and the manual screen-reader listen-through.

---

## 3. Definition of done

The site is done when a musician can do the seven things in
[RFC-001 §6](../proposals/001-two-machines-website.md#6-what-done-means).

Plus, mechanically:

- [x] Coverage 100% on tiers 1–2, with `all: true` (387 unit tests)
- [x] Tier 3 contract tests green against the vendored quiver 0.3.3 (pin moved to
      the registry version `@quiver-dsp/wasm@0.3.3`, 14 Aug 2026)
- [x] axe clean on every page (WCAG A/AA, in CI forever)
- [x] Every instrument works with no mic and no guitar (asserted in tests)
- [x] Every citation resolves (per-chapter e2e; /sources generated from the
      49-source manifest)
- [x] Rights checklist clean (run recorded in Rights and legal §8)
- [x] Every editorial claim marked; no editorial claim footnoted (e2e asserts the
      structural separation; the §8 read-through closed the gaps)
- [x] The worklet and wasm resolve at the deployed prefix (smoke + e2e)

---

## 4. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Quiver gaps take longer than expected** | medium | blocks all audio | The prototype Web Audio engine still works. If Phase 1 slips badly, ship on it and swap later — [D-035](../decisions/035-quiver-patch-audioworklet.md) is the only decision that would need revisiting. |
| **Worklet/wasm 404 in production** | **high** | audio silently dead | Phase 2 deploys a placeholder early *specifically* to find this. Smoke-tested in CI. |
| **100% coverage becomes theatre** | medium | false confidence | `all: true`; the anti-gaming rule; tier 3 outside the percentage. |
| ***The Guitar Circle* arrives late, and contradicts a drafted chapter** | medium | rework in 3 chapters | Draft with inline attribution and `TODO(guitar-circle)` markers so a correction is a grep, not a rewrite. |
| **No third *Discipline* meter source** | medium | one hedged claim | Hedge it explicitly; the engine models meters the user can edit regardless. |
| **Bun/Gatsby friction** | medium | slow start | `trustedDependencies` documented; drop the sharp plugins entirely. |
| **Scope creep in the Discipline half** | high | never ships | The size ladder is the mechanism. Anything over budget gets cut. |
| **DGM complaint** | low | content removal | [Rights and legal](../architecture/rights-and-legal.md) designed the constraints in from the start. |

The two worth watching are **worklet URLs** (high likelihood, silent failure) and **scope
creep** (high likelihood, fatal). Both have structural mitigations rather than good
intentions.
