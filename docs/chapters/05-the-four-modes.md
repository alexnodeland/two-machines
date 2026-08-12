---
title: "Chapter 5 · The four modes"
page: /machine/the-four-modes
last_updated: 2026-08-11
related_adrs: ["003", "004", "020", "032"]
---

# Chapter 5 · The four modes

## One idea

Fripp used four names — Pure, Applied, Discotronics, Soundscapes — and each name marks a
change in the signal path, not a change of style.

## What the reader can do afterwards

Hear a Fripp loop recording and say which mode it is by asking one question: what is
wired around the loop? Nothing else on the site depends on the taxonomy; this chapter
keeps the names from leaking into each other.

## Outline

Short chapter, one section per mode plus a boundary section. Each mode gets: **what
changes in the signal path**, one paragraph, and **two listening examples** — outbound
links to legal streams, never hosted audio (ADR-032).

1. **The boundary first: the Fripp & Eno records are *not* Frippertronics.** Fripp is
   insistent (v1 §1.5). *(No Pussyfooting)* and *Evening Star* use the same rig and
   predate the name; the name marks *Fripp's own practice* with the system, dated by
   Tamm to June 1977, named 5 February 1978 at the Kitchen (bibliography C-01 — Tamm
   sole authority, attributed). Eno's demonstration is chapter 2's story; here it is one
   sentence and a link back.
2. **Pure.** The loop alone: guitar → pedalboard → the two Revoxes → PA. Nothing else in
   the path. Listen: *Let the Power Fall*; "Marriagemuzic" (the B-side Pure piece,
   cross-linked from chapter 7).
3. **Applied.** The same loop wired *into someone else's music* — Frippertronics as a
   part within songs. Listen: *Sacred Songs* (Daryl Hall); *Exposure*. The
   *Sacred Songs*-was-first claim appears here, attributed to Tamm, never flat (see
   hedged claims). Release dating per C-02: "recorded late 1977, released 1980", and
   Tamm is not cited for the release year.
4. **Discotronics.** A rhythm section added around the loop. Fripp's own definition,
   quoted: "that musical experience resulting at the interstice of Frippertronics and
   disco" (*Under Heavy Manners* liner notes, quoted in Tamm). The repeated word
   *interstice* across this and the Frippertronics definition gets its one sentence
   (bibliography §1). Listen: *God Save the Queen/Under Heavy Manners* side two; the
   League of Gentlemen.
5. **Soundscapes.** The tape is replaced: digital delays, stereo, no reels — the same
   feedback idea with every physical constraint from chapter 3 renegotiated. Listen:
   *Music for Quiet Moments*; second example chosen with Part V's curriculum (see
   acceptance).

## Interactive

| | |
|---|---|
| Size | **S** — a signal-path diagram that morphs between the four modes |
| Component | `<SignalPathModes>` — inline SVG, themed (content methodology §6) |
| States | `pure` → `applied` → `discotronics` → `soundscapes`; the loop core stays fixed, what is wired around it changes |
| Colour | semantic per ADR-020 — record path brass, playback path aqua, in the diagram exactly as in the Rig |
| What it teaches | the taxonomy *is* the wiring: each name adds or replaces one thing around an unchanged loop |
| What it must not imply | that the modes are four eras with hard boundaries; that the Fripp & Eno records are a fifth mode or a zeroth one — they sit outside the diagram, stated in text |

Not an audio interactive: the Rig above the page already sounds; this diagram only has
to show wiring. Text alternative states each mode's difference as a sentence, not a
description of the picture.

## Sources

- **v1 §1.5** (client brief) — the four-mode taxonomy and Fripp's not-Frippertronics
  insistence about the Eno collaborations. Origin of the chapter's shape.
- **Tamm 1990** (obtained, full text — bibliography §2) — the *Sacred Songs*-was-first
  sentence, verified verbatim; the Frippertronics definition and the Discotronics
  definition, both quoted in Tamm; the June 1977 / 5 February 1978 dates (C-01).
- ***Under Heavy Manners* liner notes**, via Tamm — the Discotronics definition.
- **DGM Live — Frippertronics page** (bibliography §1) — corroborating description of
  the practice; not load-bearing.
- Listening examples resolve to Part V (`/listen`) entries, which link out; this
  chapter cites no stream directly.

## Claims requiring the editorial mark

- The framing that "each name marks a signal-path change, not a style" — the taxonomy
  is Fripp's, the *criterion* is ours. One page-level mark.

Per ADR-003 it carries no citation.

## Claims that stay hedged

- ***Sacred Songs* was the first recorded use of Frippertronics* — **rests solely on
  Tamm** (content methodology §2) and is always "Tamm states…", never flat. A second
  source remains wanted.
- The Kitchen naming date and the June 1977 practice date — Tamm sole authority
  (C-01); attributed, and flagged in `/sources`.
- Whether "Applied" and "Discotronics" were ever stable categories for Fripp or
  liner-note coinages that stuck — reported, not resolved.

## Rights notes

- **No hosted audio, ever** (ADR-032) — every listening example is an outbound link to
  a legal stream, and the page says so.
- The two definition quotations are within the ~50-word budget; the interstice
  definition is one of the two sanctioned longer exceptions (content methodology §4).
  Neither is an aphorism; the site-wide cap of four (ADR-030) is untouched here.
- "Frippertronics" used descriptively throughout, never as brand (ADR-004).
- Tamm is quoted in short attributed excerpts only; the full text is never committed
  (bibliography §2 warning).

## Acceptance criteria

- [ ] A reader can name the mode of a recording by asking what is wired around the
      loop — and can say why *(No Pussyfooting)* is none of the four.
- [ ] The *Sacred Songs* claim is attributed to Tamm at every occurrence; a flat
      statement anywhere fails review.
- [ ] Each mode has two listening examples, all outbound; zero audio files ship with
      the page.
- [ ] The Soundscapes second example is settled jointly with Part V before this ships.
- [ ] The diagram morphs between exactly four states, keeps the loop core visually
      fixed, and has a text alternative carrying the same distinctions.
- [ ] The chapter makes its point with audio disabled — it is a wiring argument.
