---
title: "Chapter 4 · The grammar"
page: /machine/the-grammar
last_updated: 2026-08-11
related_adrs: ["003", "012", "021", "029"]
---

# Chapter 4 · The grammar

## One idea

The idiom has a small learnable grammar — six habits that follow from the machine's
constraints — and every one of them can be practised on this page with no guitar.

## What the reader can do afterwards

Run a complete Frippertronics performance shape from memory: seed a loop with three
notes, choose beeping or droning deliberately, play over the loop without committing to
it, recover from mud, enter notes without attack, and write a sequence plan before
touching anything.

## Outline

Six lessons, each an **anchor** (`#lesson-1` … `#lesson-6`), each deep-linking the Rig
with a preset from [Audio engine §9](../architecture/audio-engine.md#9-presets). The
prose per lesson is a prompt, not an essay — the exercise carries it. Chapter 3 said
*why*; this chapter is only *how*.

1. **Three notes and silence.** Seed the loop with three tones — Lamont's grammar: the
   root; the fifth or third; something less obvious, a higher octave, a second or a
   major seventh — then *stop and listen* until the loop suggests the next move.
   *(Prototype: `s-three-notes.html` ✅.)*
2. **Beeping and droning.** The two elementary textures: short staccato marks that read
   as rhythm, sustained tones that fuse into harmony. The lesson is hearing where one
   becomes the other. *(Prototype: `m-beeping-droning.html` ✅.)*
3. **Not committing.** The two-pedal split (ADR-012): `recordHead` at zero, `monitor`
   up — play audibly over the loop while nothing enters the tape. Then the modern
   equivalents, taught as instances of the same idea, not pedal tips: delay off with
   trails engaged, a record-enable switch, input gain before the loop. **The most
   important lesson on the site** (v2 §1.3, Plan-001 Phase 5) — and currently the one
   with no prototype; the exercise must be designed, not ported.
4. **Avoiding mud.** Overload the loop deliberately — feedback near unity, record head
   full — hear Lamont's "sonic equivalent of mud", then pull back and hear it clear
   over the next passes. Failure first, on purpose; the mud meter names what happened.
5. **Volume swells and soft attack.** Enter notes without a transient — swell in with
   the volume pedal — because every attack committed to the loop returns every pass.
   Chapter 3.3's sustain-governs-gesture claim, as a hand skill.
6. **Writing a structure.** The sequence-plan format, capstone: *organ drone in D; high
   glockenspiel; improvise in D minor; when the drone fades move to A or E minor;
   return to D.* The form is fixed, the content is free. The reader writes their own
   plan and plays it against the Rig.

## Interactive

| # | Lesson | Size | Preset | Prototype |
|---|---|---|---|---|
| 1 | Three notes and silence | **S** | `three-notes` (3.5 s, fb 0.80) | `s-three-notes.html` ✅ |
| 2 | Beeping and droning | **M** | `beeping` (4.0 s, fb 0.78) | `m-beeping-droning.html` ✅ |
| 3 | Not committing | **S** | `not-committing` (4.5 s, fb 0.82, **record 0.00**) | — |
| 4 | Avoiding mud | **S** | `mud` (3.0 s, **fb 0.96**, record 1.00) | mud meter exists |
| 5 | Volume swells | **S** | `swells` (5.0 s, fb 0.80, monitor 0.60) | — |
| 6 | Writing a structure | **M** | *no preset exists yet — see acceptance* | — |

- Every deep link is URL state, shareable, validated on read; URLs go through
  `withPrefix` (ADR-029).
- All six lessons run on the tone pads — **no guitar, no microphone** (Audio engine §4).
- What lesson 3 must not imply: that the split is a workaround or a trick — it is the
  mechanism of the melody/harmony split from chapter 3.3.
- What lesson 4 must not imply: that mud is a wrong answer rather than a boundary you
  learn by crossing. The `runaway` preset stays out of this chapter; past-unity belongs
  to the Rig's own page.

## Sources

- **Norman Lamont, *How I play Frippertronics*, parts 1–2** — the only decent published
  method found (bibliography §4). Carries: the three-note grammar verbatim; the
  sit-and-listen habit; the mud description; the minimum-kit list quoted in chapter 6.
- **v2 §1.3** (client brief) — the case that the two-pedal split is the most important
  technical detail on the site. Origin of the framing, not a citation for it.
- Lesson 3 has **no published source**: Lamont does not teach the split, and the
  Tooley/Gaskin material describes it without teaching it. The lesson is built from
  ADR-012 and the engine contract, and says so.
- The sequence-plan format follows Lamont part 2; **the capstone plan's wording must be
  verified against Lamont before printing** — it is not yet among the verified
  quotations in the bibliography.

## Claims requiring the editorial mark

- "Delay off with trails engaged *is* lifting the record head" — the identification of
  the modern equivalents with the two-pedal idea is our teaching frame (ADR-012 makes it
  an engine fact; calling it the *same idea* is ours). One mark on lesson 3.
- The six-lesson grammar itself — the claim that these six habits constitute the idiom —
  is our curriculum, not Fripp's or Lamont's syllabus. Page-level mark.

Per ADR-003, neither carries a citation.

## Claims that stay hedged

- Whether Fripp practised anything like this sequence. Lamont's method is Lamont's;
  the prose must not retroject it onto Fripp.
- Whether the capstone plan is Lamont's own example or paraphrase — hedged until
  verified against part 2.

## Rights notes

- Lamont is quoted within the ~50-word continuous budget and deep-linked, never
  mirrored (content methodology §4).
- No Fripp quotation appears; the aphorism budget (ADR-030) is untouched here.
- No tab, no transcription, no pattern — the lessons are procedures, not pieces
  (ADR-031 untouched but worth the check).

## Acceptance criteria

- [ ] Each of the six lessons deep-links a Rig preset and completes with no guitar and
      no microphone (the page-spec acceptance).
- [ ] A preset for lesson 6 is added to Audio engine §9 before this ships — the table
      currently stops at `swells`.
- [ ] Lesson 3 exists as a designed exercise, not a paragraph: the reader audibly plays
      over the loop with `recordHead` at zero and *hears* that nothing accumulated.
- [ ] Lesson 4 reaches mud and recovers; the mud meter's reading matches what is heard.
- [ ] Lamont is quoted within budget and every factual claim resolves to `/sources` in
      one click.
- [ ] The chapter makes its point with audio disabled (meters and prompts carry it).
