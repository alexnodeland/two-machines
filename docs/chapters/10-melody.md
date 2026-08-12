---
title: "Chapter 10 · Perpetuum mobile, distributed line"
page: /discipline/melody
last_updated: 2026-08-11
related_adrs: ["003", "022", "031", "032"]
---

# Chapter 10 · Perpetuum mobile, distributed line

## One idea

Continuous line, and line distributed across bodies — a melody can survive being longer
than one player's hands, whether the extra hands are a circle of guitarists or a device
in the instrument.

## What the reader can do afterwards

Say what a circulation is — one line, one note per player, passed around a circle — and
why it is the collective analogue of the delay line: the loop is the circle, and the
delay is one seat's worth of time.

## Outline

**This is the thinnest chapter on the site, and the page says so — in its first
paragraph, not in a footnote.** v2 §2.4 concedes this section needs the most original
work, and that work — interviewing living crafties — is out of scope for v1
([RFC-001 §5](../proposals/001-two-machines-website.md#5-scope-boundaries)). Honesty
about the gap beats padding it; "padding a thin chapter" is on the voice Don't list, so
the shortest prose budget on the site (~500 words) is a feature, not a symptom.

1. **The gap, stated.** What is actually known about Craft melodic practice from
   published sources, and what would require asking people who were in the room. One
   paragraph, no apology beyond it, a pointer to the sources page. The site is the
   thing you show a crafty when you eventually do ask. TODO(guitar-circle)
2. **Continuous line.** Cross-picking and the perpetuum-mobile repertoire: unbroken
   streams of notes, one per pick-stroke, at even dynamics — a single player doing what
   the tape loop otherwise does, keeping material in the air by never stopping.
   TODO(guitar-circle)
3. **Line distributed across bodies.** Circulations: a line passed around a circle,
   one note per player. No player holds the melody; the *circle* does. The analogy to
   Part II is put plainly and marked as ours: the loop is the circle, the delay is one
   seat's worth of time. The reader plays this before reading it (interactive below).
4. **The instrument absorbs the rig.** The Fernandes Sustainer era: infinite sustain
   moves from the feedback loop *outside* the guitar (tape, then digital delay) into
   the string itself. The rig taught the note to last; then the instrument learned the
   trick. Our framing; marked. TODO(guitar-circle)
5. **Ergonomics first.** The Craft picking approach is built from how a hand works
   outward, not from repertoire inward — which connects directly to why Fripp was at an
   Alexander Technique congress at all (Dublin, 2025). One paragraph, then point at
   chapter 7's account of the teaching lineage. TODO(guitar-circle)

## Interactive

| | |
|---|---|
| Size | **M** — circulations, **reusing the Cycles dials view** (no new engine, no new face) |
| Component | `<Cycles>` in dials view, circulation preset |
| Preset | `circulation` — N seats around the circle, one note each, shared pulse; the reader changes N, drops a seat, speeds the pulse. The line audibly survives redistribution |
| What it teaches | a melody as a property of the circle, not of any player; one seat's worth of time as the delay interval — the bridge back to Part II |
| What it must not imply | any actual Craft repertoire or circulation exercise (the preset is pulse and generic pitch, not a piece); that circulation practice is documented in detail here — the chapter has already said it is not |

**Dependency — Q-07** ([Open questions](../architecture/open-questions.md)): the dials
view is circular, the beeping/droning M has a circular loop face, and whether the
site's circle-count is coherent visual language or one ring too many is open, against
the one-page-effect rule (ADR-022). This chapter *reuses* an existing face rather than
adding one — the cheapest circle on the site to keep — but the preset is not built
until Q-07 is resolved by placing the two rings side by side.

## Sources

Thin, and listed honestly as such:

- **Guitar Craft publications** — [guitarcraft.com/publications](https://guitarcraft.com/publications/)
  (bibliography §1, live) — the nearest published thing to picking material. Nothing
  verified verbatim yet; what the chapter can lean on must be extracted before writing.
- **Fripp, *The Guitar Circle*** (§1, 🛒 ordered from DGM, not yet arrived) — the
  chapter's best hope of thickening *within scope*. Every `TODO(guitar-circle)` above
  is re-verified on arrival; the grep is the revision checklist (Plan-001 §1).
- **Wikipedia — Guitar Craft** (§5) — orientation only.
- **Sustainer-era rig notes** (§7: Fripperies, Premier Guitar Rig Rundown, MusicRadar
  rig tour) — all flagged *to re-verify*, and the bibliography currently says none
  carries a load-bearing claim. Step 4 would make one load-bearing: **verify before
  writing**, or the Sustainer paragraph stays at the level of the marked framing.
- **Alexander Technique Congress keynote, Dublin 2025** (§1) — seven YouTube parts,
  uncaptioned, needs transcription. Supports step 5's "why he was there at all".

## Claims requiring the editorial mark

- **The circle-as-loop analogy** — "the loop is the circle, the delay is one seat's
  worth of time." Ours. It also appears in chapter 8's circulation section: one
  phrasing, marked in both places, cited in neither (ADR-003).
- **The Sustainer framing** — "the instrument absorbs a function the rig used to
  provide." Ours; the gear facts underneath it are sourced (§7, once verified), but the
  absorption reading carries the mark and no citation.

## Claims that stay hedged

- **Nearly everything about circulation and picking practice.** The published record is
  thin; the prose reports what the sources carry and says plainly where they stop.
  TODO(guitar-circle)
- **How direct the Alexander connection is** — ergonomics-first picking and Fripp's
  presence at the congress are both real; whether the one explains the other is stated
  as the obvious question, not as fact. TODO(guitar-circle)

## Rights notes

- **No Craft repertoire in the circulation preset.** ADR-031 names King Crimson, but
  the same logic covers Craft pieces — they are copyrighted compositions, and the
  preset stays pulse-and-generic-pitch so it structurally *cannot* carry one.
- No hosted audio (ADR-032) — the circulation sounds via the site's own synthesis only.
- No quotation is planned for this chapter; the aphorism budget (ADR-030) is untouched.
  Craft aphorisms are the obvious temptation for padding a thin chapter — resisting
  them is both the voice rule and the legal rule agreeing.

## Acceptance criteria

- [ ] The chapter states its own thinness in its first paragraph, on the page — and
      says *why* (interviews out of scope for v1), with the pointer to RFC-001 §5.
- [ ] Prose stays under ~500 words; nothing pads, nothing restates the preset.
- [ ] A reader can say what a circulation is and why it is the collective delay line
      (the one-sentence test).
- [ ] The circulation preset carries no repertoire — structurally, not by policy.
- [ ] Q-07 is resolved before the preset is built; the dependency is recorded in the
      build plan.
- [ ] Both editorial claims carry the mark and no citation; hedged claims stay hedged.
- [ ] The §7 Sustainer sources are verified before step 4 asserts any gear fact.
- [ ] Every Guitar Craft–sourced assertion carries `TODO(guitar-circle)` until checked
      against the book.
- [ ] The chapter makes its point with audio disabled (the dials view carries it).
