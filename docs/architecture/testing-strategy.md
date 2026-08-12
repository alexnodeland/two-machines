---
title: "Testing strategy"
last_updated: 2026-08-11
related_adrs: ["027", "028", "029", "035", "037", "041"]
---

# Testing strategy

How 100% coverage is achieved **honestly** rather than nominally.

The requirement is 100% from the first commit. The risk is that 100% becomes a number
you game rather than a claim you can stand behind. This document is mostly about that
risk.

---

## 1. The central problem

**jsdom does not implement the Web Audio API.** Not partially — at all. So the naive
plan (render components in jsdom, assert on audio) is impossible.

Compounding it: the DSP now lives in WebAssembly inside an AudioWorklet
([D-035](../decisions/035-quiver-patch-audioworklet.md)),
which is a separate thread with a `postMessage` boundary and no DOM.

The resolution is a **three-tier strategy**
([D-028](../decisions/028-three-tier-testing.md))
that puts most of the logic somewhere it can be tested properly.

---

## 2. The three tiers

### Tier 1 — pure math · node · **the bulk of the coverage**

`src/audio/math/**`. Only pure functions of numbers. No `AudioContext`, no DOM, no
imports outside the directory (ESLint-enforced).

Covers: `distanceToSeconds`, `repeatsToInaudible`, `decayTime`, `feedbackState`,
`ageToCutoff`, `vuSegments`, `midiToFreq`, `gcd`, `lcm`, `lcmAll`, `isHit`,
`coincidences`, `longestGap`, `longestInterlock`, `density`, `returnPulses`,
`driftBeatSeconds`, `phaseAt`.

Fast, deterministic, trivially 100%. **This is the design's payoff**: the split was made
so that the interesting logic lives here
([D-027](../decisions/027-pure-from-wiring-split.md)).

Table-driven, with the worked values in
[Cycles engine §3](cycles-engine.md#worked-values-for-test-fixtures) as fixtures. Property
tests where a law exists — `lcm(a,b) * gcd(a,b) === a*b`; `coincidences` is invariant
under voice reordering; `longestInterlock === longestGap - 1`.

### Tier 2 — wiring and components · jsdom + mocks

Controllers, hooks, React components. The `AudioContext` and `QuiverAudioNode` are
mocked. What is asserted is **that the right calls were made with the right values**,
never that audio was produced.

Examples: dragging a deck emits one `setParam` per animation frame, not per pointer
event; loading a preset applies every parameter; a hand-edited URL with an out-of-range
value is clamped; the mute button reaches the master gain.

Mocking: a hand-rolled `QuiverAudioNode` fake, since we control the interface and only
need the calls. `standardized-audio-context-mock` is available if a fuller Web Audio
surface is needed. The goal is to test **our usage** of the API, not the API.

### Tier 3 — real audio · Playwright + `OfflineAudioContext`

Actual DSP behaviour, in a real browser, rendered offline and asserted numerically.
**Not counted toward coverage thresholds** — this is behavioural verification, not line
coverage.

This tier asserts the contract in
[Audio engine §8](audio-engine.md#8-behavioural-contract) against the oracle:

- silence in → silence out
- a 0.9 s note at 0.85 feedback still audible 2.6 s later
- feedback 0 → one pass then silence
- feedback ≥ 1.0 → level non-decreasing over 10 s
- **feedback 1.18 → output never exceeds the limiter ceiling** (a safety test, see
  [Accessibility §2](accessibility-and-interaction.md#2-audio-consent))
- `recordHead` 0 → dry audible, nothing enters the loop
- `monitor` 0 → tape audible, live playing silent
- tape age 1.0 → measurable HF loss per pass

The prototype `mockups/engine.js` is the oracle
([D-041](../decisions/041-prototype-as-behavioural-oracle.md)).
A quiver patch that sounds different is a regression until argued otherwise.

---

## 3. Coverage configuration

```ts
coverage: {
  provider: 'v8',
  all: true,                    // ← non-negotiable
  include: ['src/**/*.{ts,tsx}'],
  exclude: [
    'src/**/*.d.ts',
    'src/pages/**',             // Gatsby page shells; covered by e2e
    'src/templates/**',         // ditto: MDX chapter routing shells
    'src/data/references.ts',   // generated
    '**/__mocks__/**',
  ],
  thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
}
```

### `all: true` is the whole game

Without it, coverage reports only files your tests imported — so **100% is reachable by
simply not importing your worst module.** With it, untested files appear at 0% and cannot
hide.

If one number in this file is load-bearing, it is that one.

### On exclusions

Every exclusion is a small lie, so each is justified above and reviewed at each planning
pass. `src/pages/**` is excluded because Gatsby page shells are trivial re-exports whose
real behaviour is routing — covered by e2e instead. If a page grows logic, it moves into
a component and stops being excluded.

**`perFile: true`** is deliberately **off**. With global 100% thresholds it changes
nothing; turning it on would only matter if we lowered the bar, and we are not going to.

---

## 4. What 100% does not mean

Recorded plainly so the number is not oversold:

- It does **not** mean the audio is correct. Tier 3 addresses that, and tier 3 is not in
  the percentage.
- It does **not** mean the DSP is correct. The DSP is Rust in quiver and is covered by
  quiver's own suite, which sits at ≥80%.
- It does **not** mean the prose is accurate. That is what
  [References](bibliography.md) is for.
- It does **not** mean the site is usable. That is
  [Accessibility](accessibility-and-interaction.md).

100% line coverage of tiers 1–2 means **every branch we wrote has been executed with at
least one meaningful assertion**. That is worth having and it is not the same as
correctness.

### The anti-gaming rule

A test that executes a line without asserting anything about it is not a test. Reviews
reject coverage-only tests. If a branch is genuinely unreachable, delete the branch
rather than writing a test for it or excluding the file.

---

## 5. End-to-end

Playwright, running against the **built site with `pathPrefix` applied** — not
`gatsby develop`. Several failure modes only exist in the prefixed build.

Blocking checks:

| Check | Why |
|---|---|
| Every page renders, no console errors | baseline |
| **`quiver.worklet.js` and `quiver_bg.wasm` resolve at the deployed prefix** | [D-037](../decisions/037-prefix-aware-worklet-wasm-urls.md) — invisible until someone presses play |
| No raw internal `href` 404s under the prefix | [D-029](../decisions/029-github-pages-pathprefix.md) |
| Audio does not start without a gesture | [Accessibility §2](accessibility-and-interaction.md#2-audio-consent) |
| Every instrument works with the mic denied | floor 1 |
| `axe-core` clean on every page | [Accessibility §8](accessibility-and-interaction.md#8-testing) |
| Keyboard-only path through both L's | floor 5 |
| Reduced-motion emulation | [Accessibility §3](accessibility-and-interaction.md#3-motion) |
| Every citation link resolves | [Bibliography](bibliography.md) |

That last one deserves emphasis: **a bibliography with dead links is worse than no
bibliography.** Run it on a schedule as well as in CI — the briefs already contained
three link-rot errors, one of which was wrong in the other direction.

---

## 6. Test data and determinism

- **No `Math.random()` in tests.** The noise buffer takes an injected RNG.
- **No wall-clock time.** The transport takes a clock; tests supply a fake.
- Fixtures for the cycle math come from [Cycles engine §3](cycles-engine.md), which is
  itself checked against the existing five-against-seven page — the source of the
  `longestInterlock` convention.

---

## 7. What runs when

| | Local pre-commit | Local pre-push | CI |
|---|---|---|---|
| Format, lint | ✅ | ✅ | ✅ |
| Type-check | | ✅ | ✅ |
| Tier 1 + 2 + coverage | | ✅ | ✅ |
| Tier 3 (offline audio) | | | ✅ |
| E2E + axe | | | ✅ |
| Link check | | | ✅ + weekly |

Coverage thresholds fail the build. There is no soft mode.
