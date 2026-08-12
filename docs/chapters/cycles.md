---
title: "Cycles"
page: /cycles
last_updated: 2026-08-11
related_adrs: ["015", "016", "017", "018", "031", "043"]
---

# Cycles

## One idea

The Cycles engine, full-page: the thesis as a research instrument rather than an
illustration — edit the cycles yourself and the arithmetic answers.

## What the reader can do afterwards

Build any offset or drift configuration, read off its return, coincidences and
interlock, and share the exact state as a URL.

## Outline

**The page is an instrument, not a chapter.** Minimal prose: a one-line statement of
what it is, the meters-only guarantee, the tempo-audibility caveat, and nothing else.
The teaching lives in Part I and chapter 8, which deep-link here; this page assumes
you arrived knowing why.

1. **Transport and rack** ([Cycles engine §8](../architecture/cycles-engine.md#8-interaction)):
   per-voice cycle stepper, hit toggles, mute; space toggles transport; full keyboard
   operation. Editing a preset clears the preset label.
2. **Three views, one canvas** ([§4](../architecture/cycles-engine.md#4-views)):
   **Grid** (explanatory; disabled in drift mode — the point, not a limitation),
   **Ribbon** (time view, capped at 120 pulses, says so on-canvas when truncating),
   **Dials** (the only view that survives drift).
3. **All presets** ([§5](../architecture/cycles-engine.md#5-presets)): `claps` (5 v 7),
   `discipline` (15 · 14 · 17), `frame` (7 · 6), `thela` (7 · 8), `indiscipline`
   (15 · 8), `drift` (8 v 8 at ×1.00/×1.04). King Crimson presets are **meters only** —
   a cycle length and a downbeat, nothing else — and the page **prints that guarantee**
   (ADR-017, ADR-031), plus the caveat that tempos are chosen for audibility, not
   fidelity (§5).
4. **Readouts**: return, coincidences, interlock. The UI prints `longestInterlock`
   (5 v 7 → **17**), never `longestGap` (ADR-018).
5. **Shareable URL state**: full configuration in the URL, validated on read — a
   hand-edited URL must never produce an invalid engine state. Part I and ch. 8 deep
   links are these URLs with preset ids.

## Interactive

| | |
|---|---|
| Size | **L**, full-page — the page *is* the interactive |
| Component | `<Cycles>` with rack, transport, view switcher |
| Presets | all six above, deep-linkable |
| What it teaches | nothing new — it is where Part I and ch. 8 send readers to work |
| What it must not imply | that a KC preset contains a part (it cannot — the engine expresses only meters); that drift ever resolves; that preset tempos are record tempos |

A real use worth preserving (§8): loading the published *Discipline* meters into the
rack to check the sequence's internal coherence — the engine as research instrument.

## Sources

- Preset provenance only, linked per preset: Dublin keynote 4 Aug 2025 (`claps`);
  *Discipline* 1981, "Frame by Frame", "Thela Hun Ginjeet", "Indiscipline" — meters
  from the published sequence, which still rests on **one** independent source
  (bibliography §5; Q-03).
- No prose claims beyond provenance, so no other citations.

## Claims requiring the editorial mark

None on this page. The thesis claims live in Part I; this page states only arithmetic
and provenance.

## Claims that stay hedged

- The *Discipline* meter sequence (one independent source until Q-03 resolves) — the
  preset ships, but any printed provenance note reflects the single-source status.

## Rights notes

- **Meters only, and the guarantee is printed on the page** — not just recorded in the
  docs (ADR-017, ADR-031; [Rights R-3](../architecture/rights-and-legal.md#r-3--no-king-crimson-transcriptions-or-tab)).
  Presets carry a cycle length and a downbeat; timbres are generic strikes
  distinguished by register alone; any richer pattern is built by the user.
- No quotation, no aphorism; both budgets untouched.

## Acceptance criteria

- [ ] Every preset loads from a shareable URL and reproduces exactly.
- [ ] The meters-only guarantee is visible on the page, verbatim in intent.
- [ ] Grid is unavailable in drift mode, with the reason stated, not greyed silently.
- [ ] The interlock readout prints 17 for 5 v 7 (and 209 / 3569 for the *Discipline*
      fixtures — [worked values, §3](../architecture/cycles-engine.md#worked-values-for-test-fixtures)).
- [ ] Hand-edited URLs are validated on read; no invalid state is reachable.
- [ ] Fully keyboard-operable; canvas carries a live textual summary (ADR-043).
- [ ] The tempo-audibility caveat is printed alongside the KC presets.
