---
title: "Chapter 8 · The interlock"
page: /discipline/rhythm
last_updated: 2026-08-11
related_adrs: ["003", "016", "017", "018", "031"]
---

# Chapter 8 · The interlock

## One idea

The clapping exercise and the *Discipline* interlock are the same object at different
scales.

## What the reader can do afterwards

See — without doing arithmetic — that the two guitars realign every 210 sixteenths
(≈48 s) while all three parts agree only once every 3570, about 13½ minutes, longer
than the track; and say why this is not Reich phasing.

## Outline

The heaviest interactive chapter. Three sections; the engine carries each, the prose
names what was played. Drafted before *The Guitar Circle* arrives: every Guitar Craft
assertion below carries a literal `TODO(guitar-circle)` marker, and
`grep -rn "TODO(guitar-circle)"` is the revision checklist when the book lands
(Plan-001 §1).

1. **The counting and clapping exercises.** Part I's five-against-seven returns as the
   thing Fripp actually teaches — the Dublin keynote is the source, blocked on
   transcription. The reader has already *played* this object in Part I; the section's
   work is telling them so. `claps` preset. TODO(guitar-circle): whether the book
   gives the exercises' canonical form and lineage.
2. **Guitar Craft circulations.** A note passed around a circle of players, one seat
   per pulse — the collective analogue of the delay line. **The loop is the circle;
   the delay is one seat's worth of time.** That analogy is ours and wears the mark.
   The description of circulation practice is currently sourced to Wikipedia — Guitar
   Craft and secondary accounts. TODO(guitar-circle): the book confirms, sharpens or
   overturns every sentence in this section.
3. **The *Discipline* interlock.** Meters only: guitars at 15 against 14 in
   sixteenths; drums a cycle of 17 (*Bruford and the Beat*: 17/16 over a 4/4
   bass-drum groove). The generative device is startlingly simple — one player takes
   the other's phrase and cuts the last note — attributed to its source, never
   presented as our reconstruction. TODO(guitar-circle): the book may give the
   device's canonical account. Then the two numbers, and the two things said loudly:
   - **This is not Reich phasing.** Reich is *drift* — two tempos, no return; the
     `drift` preset ("the Reich case") appears once here, its grid disabled because
     there is nothing to come home to (ADR-016). *Discipline* is *offset* — one
     shared pulse, different cycle lengths, return guaranteed at the LCM. The 7dmedia
     piece draws the same contrast and is cited.
   - **It is the same object as the clapping exercise** — same model, same three
     fields, bigger numbers. The chapter's editorial claim; it wears the mark.

The two numbers, printed in prose as arrived at in the engine: guitars-only return
**210** sixteenths (≈48 s); full return **3570** — about 13½ minutes, longer than the
track. A listener never hears the full resolution; say that plainly (Cycles engine §3).
And the tempo-honesty sentence from Cycles engine §5: presets are tuned for
audibility, not fidelity — the record's sixteenths run near 480/min, too fast to hear
the interlock as an interlock — and the page says so rather than implying the preset
is the tempo.

## Interactive

| | |
|---|---|
| Size | **L** — the Cycles engine, with all offset presets |
| Component | `<Cycles>` |
| Presets, stepped inline | `claps` (5·7 — return 35, interlock 17) → `discipline` (15·14·17 — return 3570) → guitars-only via muting the drum voice (15·14 — return 210) → `frame` (7·6) → `thela` (7·8) → `indiscipline` (15·8) → `drift` once, in the not-Reich passage |
| What it teaches | the same grid that showed 5-vs-7 shows 15-vs-14; muting the drum voice collapses 3570 to 210 before the reader's eyes; the rack is open, so a reader can load the published meters and check the sequence themselves — the engine as research instrument (Cycles engine §8; the Q-03 fallback) |
| What it must not imply | anything beyond cycle length and downbeat (ADR-017, ADR-031 — never a pattern, never tab); that the preset tempo is the record's tempo; that drift ever resolves; that phasing and interlocking are the same trick |

Readouts print `longestInterlock`, never `longestGap` (ADR-018): **17** for the claps
preset, **209** guitars-only, **3569** for the full *Discipline* preset. The prose's
realignment numbers are the returns, 210 and 3570; the interlock figures are what the
UI prints.

## Sources

- **Dublin keynote, 4 Aug 2025** — the counting/clapping exercises. Seven YouTube
  parts, uncaptioned; **needs transcription — a Plan-001 Phase 0 blocker.** Until it
  exists, §1 drafts against the substack serialisation notes and is finalised from the
  transcript.
- **The published meter sequence** (thissideofsanity.com) — supports §3's meters, and
  is **one independent source**: the ags.earth page carries identical text and does
  not count as a second (Q-03). Hedged as below.
- ***Bruford and the Beat*** (1982; YouTube, explanatory content intact) — the drums'
  17/16 and the 4/4 bass-drum groove beneath it. Independent corroboration for the
  drum cycle only, not for the guitar sequence.
- **7dmedia looper piece** — the explicit Reich contrast; supports the not-phasing
  passage.
- ***The Guitar Circle*** — ordered from DGM, not arrived. Not cited yet; the
  `TODO(guitar-circle)` markers are its arrival checklist.
- **Wikipedia — Guitar Craft** — circulation orientation, pending the book.

## Claims requiring the editorial mark

- **"The same object at different scales"** — named in Content methodology §2 as a
  required mark. One mark, on the claim, not per paragraph.
- The circulation analogy — the loop is the circle, the delay is one seat's worth of
  time.

Per ADR-003, neither carries a citation.

## Claims that stay hedged

- **The meter sequence rests on one independent source until Q-03 resolves.** The
  hedge's shape, on the page: the sequence is *attributed, not asserted* — "as
  published at [source]", with the single-sourcing stated in the text — and paired
  with our own verification, performed with the Cycles engine as a research instrument
  against the record, and labelled as ours. If Q-03 lands a third independent source,
  the hedge shrinks to a plain citation.
- Whether the clapping patterns are doctrinal or a convenient prime — chapter 7 states
  it as open; this chapter neither reopens nor resolves it.
- Every Guitar Craft practice claim, until *The Guitar Circle* arrives.
  TODO(guitar-circle).

## Rights notes

- **Meters only** (ADR-031, ADR-017): a King Crimson preset carries a cycle length
  and a downbeat, nothing else; timbres are generic strikes distinguished by register
  alone; any richer pattern is built by the user in the rack. **The guarantee is
  printed on the page**, not just recorded here.
- No transcription, no tab, no notes. A sequence of *meters* is public analytical fact
  — the sort of thing a review prints; a pattern of hits is a composition. The line is
  drawn there deliberately.
- *Bruford and the Beat* is deep-linked, never mirrored; no hosted audio (ADR-032).
- Any quotation (Fripp or Bruford, from the film or the keynote) stays ≤~50 continuous
  words, attributed inline; no aphorism is spent here (ADR-030 budget untouched).

## Acceptance criteria

- [ ] Page-spec acceptance: a reader sees 210 and 3570 — and that 3570 outlasts the
      track — without doing arithmetic.
- [ ] Muting the drum voice visibly collapses the return from 3570 to 210.
- [ ] Interlock figures printed are 17 / 209 / 3569; the gap figures never appear in
      the UI.
- [ ] Not-Reich is demonstrated, not just asserted: the drift preset's disabled grid
      appears once against the offset grids.
- [ ] The meters-only guarantee is printed on the page.
- [ ] The meter-sequence hedge is visible in the prose: attributed, single-sourcing
      stated, our verification labelled as ours.
- [ ] The tempo-honesty sentence is present.
- [ ] The editorial marks are present and carry no citations.
- [ ] Every `TODO(guitar-circle)` marker survives into the MDX draft so the arrival
      grep works.
- [ ] The chapter makes its point with audio disabled (the grid carries it).
