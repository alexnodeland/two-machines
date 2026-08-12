---
title: "Chapter 3 · What the tape does to your music"
page: /machine/what-the-tape-does
last_updated: 2026-08-11
related_adrs: ["003", "016", "030", "032"]
---

# Chapter 3 · What the tape does to your music

## One idea

The delay line is not a neutral effect — the Frippertronics idiom (modal, slow-moving,
sustained, pedal-point) is an adaptation to its constraints, not a stylistic preference.

## What the reader can do afterwards

Explain why fast lines become mud, and why the two volume pedals are not a trick — the
page-spec acceptance, verbatim. Both answers follow from one fact: the system is
additive-only. You cannot remove anything from the tape; you can only wait for it to decay.

## Outline

The intellectual centre of the Machine half. Three sub-sections, three M interactives,
one per musical dimension. The framing sentences are ours throughout (v2 §1.4) and each
wears the editorial mark; the sourced sentences in 3.2 carry citations and no mark. The
page never blurs the two.

1. **The premise.** The reader has just built the machine (ch. 1–2); this page says what
   it does back. One paragraph, marked editorial, no citation.
2. **3.1 Rhythm — a perpetual canon at a fixed interval.** Everything you play returns
   at *T*, at pitch, forever. If your phrase divides *T* evenly, you get a phase-locked
   canon; if not, accumulation. Explicitly the same arithmetic as Part I — phrase-vs-delay
   is the offset/drift distinction wearing tape (ADR-016); one sentence links back.
3. **3.2 Harmony — harmonic rhythm is a function of the feedback knob.** Additive-only:
   the rate at which you may change harmony is bounded by decay time. Hence modal,
   pedal-point repertoire — a constraint of the mechanism. Carries the three sourced
   items (see Sources): the deliberate E minor/G minor collision Fripp calls exquisite,
   using the word *interstice*; spectral rather than chordal thinking (the overtones
   account); the Monograph III harmonic-series statement as the theoretical justification
   for "avoid mud".
4. **3.3 Melody — sustain governs gesture.** Fast lines smear into mud; slow sustained
   gestures survive. The payoff, and the chapter's last word: **the tape enforces a hard
   split between melody and harmony** — what you commit to the loop becomes harmony, what
   you play over it stays melody — and the two-volume-pedal technique is the *mechanism*
   of that split. Grammar lesson 3 (`/machine/the-grammar`) re-lands this as practice.

## Interactive

Three M-size interactives, one per sub-section. Each teaches by making the constraint
happen; none requires a guitar or a microphone.

| § | Size · component | Prototype | Preset | What it teaches | What it must not imply |
|---|---|---|---|---|---|
| 3.1 | **M** `<Canon>` | `mockups/m-canon.html` ✅ | phrase length against *T*; divides-evenly toggle | phase-locked canon vs. accumulation; same arithmetic as Part I | that accumulation is failure (it is the other idiom); that this is new arithmetic |
| 3.2 | **M** `<HarmonicRhythm>` | **none yet** | feedback knob against a chord-change clock; clash audible/visible when the change outruns decay | harmonic rhythm is bounded by decay time; the knob *is* the harmonic-rhythm control | that modal/pedal-point style is mere taste; that Fripp reasoned this way (hedged, below) |
| 3.3 | **M** `<BeepingDroning>` | `mockups/m-beeping-droning.html` ✅ (mud meter) | `beeping` / `mud` (Audio engine §9) | sustain governs gesture; fast lines → mud, watched on the meter | that mud is always wrong — grammar lesson 4 overloads deliberately |

3.2 is the only interactive on the page with no mockup behind it — its load-bearing
claims have not been *played* (mockups are evidence). Prototyping it is a Phase 0 task
and the biggest open risk in this chapter; the spec above is provisional until then.

## Sources

- **v2 §1.1–1.4** (the client brief) — the *origin* of all three framings, not a
  citation for them: the claims are ours and wear the mark, per the Part I precedent.
- **Tooley interview, Winnipeg, 9 Aug 1979** ([Bibliography §1](../architecture/bibliography.md#1-primary--fripps-own-words)) —
  the deliberate E minor/G minor bitonality, "exquisite", and the word *interstice*.
  **Gap:** the source is live and archived, but this passage is *not* among the verified
  quotations in the bibliography — it must be verified verbatim against the full text
  before anything from it is printed.
- ***Michigan Daily*, 14 June 1979, p. 7** ([Bibliography §5](../architecture/bibliography.md#5-rhythm-the-interlock-and-the-tuning)) —
  the overtones passage ("hit a lot of har-monic overtones … then varied the tonal
  field"), verified verbatim, supporting spectral-rather-than-chordal as *reported
  practice*. ⚠️ Read, not archived; must be re-verified against the original before
  printing (Cloudflare blocks automated capture — see `references/README.md`).
- **Guitar Craft Monograph No. 3** (1987 poster) — the harmonic-series statement.
  **Gap:** listed in [Bibliography §10](../architecture/bibliography.md#10-still-open) as
  still open — no image is in hand. The quotation is **blocked on procurement**; 3.2
  cannot ship it until the poster is located.

## Claims requiring the editorial mark

- **All three section framings** — "a perpetual canon", "harmonic rhythm is a function
  of the feedback knob", "sustain governs gesture". Marked per section, not once at page
  level as Part I does: this page interleaves sourced fact with editorial frame, and a
  single page-level mark would blur exactly the boundary v2 §1.4 asks us to keep visible.
- The one-idea sentence (idiom as adaptation to constraint).
- The payoff: that the tape *enforces* the melody/harmony split, and that the two-pedal
  technique is its mechanism. (That the technique exists is factual, sourced in ch. 4;
  that it is the mechanism of the split is our reading.)
- That the Monograph III statement *justifies* "avoid mud" — the statement is quoted
  fact; the connection to loop practice is ours.
- The significance of the repeated word *interstice* — the repetition is verifiable;
  reading intent into it is editorial.

Per ADR-003, none of these carry a citation.

## Claims that stay hedged

- Whether Fripp connected any of this consciously — whether constraint → idiom was
  design or discovered practice. **State as a question.**
- Whether he would recognise the canon framing (methodology §2 standing hedge).
- The fifths-tuning ↔ loop-harmony resonance belongs to chapter 9 and is *not* asserted
  here — at most a forward pointer phrased as a question.

## Rights notes

- **No hosted audio** (ADR-032): the E minor/G minor discussion is prose plus synthesised
  interactive — never a clip of the Winnipeg recording or of any record.
- **This chapter spends one of the four site-wide aphorisms** (ADR-030): the Monograph
  III harmonic-series statement, in 3.2, attributed and linked. Monograph aphorisms
  count against the cap ([Rights and legal](../architecture/rights-and-legal.md)); three
  remain for the rest of the site. The Monograph is referenced, never reproduced.
- Quotations stay under ~50 continuous words per source; neither passage here is one of
  the two sanctioned longer exceptions (listening/hearing, the interstice definition).
- The bitonality is reported as key names only — no pattern, no voicing, no tab
  (ADR-031's line, respected even though this is not a *Discipline* part).

## Acceptance criteria

- [ ] A reader can explain why fast lines become mud — demonstrated on the mud meter,
      not merely described (the page-spec acceptance).
- [ ] A reader can explain why the two pedals are not a trick — the split lands as the
      chapter's payoff and is re-landed in grammar lesson 3.
- [ ] Every sourced sentence in 3.2 carries a citation; every framing sentence carries
      the mark and no citation; no sentence does both.
- [ ] The Monograph III quotation appears only once the poster is in hand; the aphorism
      ledger still totals ≤ 4 site-wide with this one counted.
- [ ] The Winnipeg passage and the *Michigan Daily* passage are re-verified verbatim
      before printing.
- [ ] 3.1 states explicitly that it is the same arithmetic as Part I, with a link back.
- [ ] The chapter makes its point with audio disabled (canon view and mud meter carry it).
