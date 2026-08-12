---
title: "Chapter 9 · The tuning as embedded theory"
page: /discipline/harmony
last_updated: 2026-08-11
related_adrs: ["001", "003", "030", "031"]
---

# Chapter 9 · The tuning as embedded theory

## One idea

New Standard Tuning is a harmonic theory implemented in hardware — retune the open
strings and you have changed what the instrument makes easy, before anyone plays a note.

## What the reader can do afterwards

Drag one shape across string sets and say why it keeps its interval content in NST and
loses it in standard tuning — and name what four stacked fifths make default (quintal
and quartal voicings, wide by construction) and what they make awkward (close thirds).

## Outline

The interactive carries the demonstration; the prose names what the hands just learned.
Order matters — the physical facts come first, the resonance last, because the resonance
is only honest once the reader has *felt* the bias:

1. **The tuning itself.** C2–G2–D3–A3–E4–G4: four stacked perfect fifths with a minor
   third on top. The third is there for a physical reason — a high B at guitar scale
   length needs a string too thin and too tense to be practical. State the physics as
   fact; whether this is also *Fripp's stated* rationale is checked against the book.
   TODO(guitar-circle)
2. **Regularity.** Standard tuning is fourths broken by one major third (G→B); NST is
   fifths all the way up until the top pair. A **regular** tuning means a shape is an
   interval structure, not a memorised grip: move it across string sets and it stays
   itself. Standard tuning's lone third is exactly what prevents this. The reader drags
   the shape and watches one fretboard keep faith and the other break it.
3. **What the stack makes default.** Fifths stacked low stay out of each other's way:
   quintal and quartal voicings fall under the hand, voicings are wide by construction,
   and the low C extends the range below a standard guitar. Steve Ball's image — the
   tuning puts you on "long stilts" — is the two-word summary. TODO(guitar-circle)
4. **What it makes awkward.** Close thirds-based triads — the entire cowboy-chord
   vocabulary — now require stretches or omissions. The tuning does not forbid
   functional harmony; it taxes it. That asymmetry *is* the embedded theory.
5. **The resonance, as a question.** Chapter 3.2 showed the feedback loop favours open,
   non-functional, spectrally clean harmony — you cannot remove a committed third that
   has stopped fitting; you can only wait. Stacked fifths bias the hand toward exactly
   the harmony the loop can survive. That observation is ours and wears the mark.
   Whether Fripp *connected* the tuning to the harmonic demands of loop playing is a
   different thing: unknown, and put in front of the reader as a question, never
   answered. TODO(guitar-circle)
6. **Origin, briefly.** Fripp's account that the tuning "flew by" in a sauna, September
   1983; adopted 1985; taught at Guitar Craft from the first courses. Report, don't
   mythologise. TODO(guitar-circle)

## Interactive

| | |
|---|---|
| Size | **M** — two fretboards, standard tuning above, C–G–D–A–E–G below |
| Component | `<Fretboards>` (new; no prototype exists — the one M interactive in Part III with no mockup ancestor) |
| Presets, stepped inline | `fifths-dyad` (a bare fifth, dragged across string sets — identical in NST, mutating in standard) → `quartal-stack` (three-note quartal voicing: one grip in NST) → `close-triad` (a close-position major triad: trivial in standard, a stretch in NST) |
| What it teaches | regular tuning → shape invariance across string sets; the stack's bias — what falls under the hand vs. what fights it |
| What it must not imply | any King Crimson or Guitar Craft repertoire figure (ADR-031 — the presets are interval shapes, never tunes); that Fripp designed the tuning *for* the loop (see hedged claims) |

Interval shapes light up as pitch classes and interval names, not as tab: the display
vocabulary is "P5 / P4 / m3", never fret-number notation that could carry a part.

## Sources

- **Wikipedia — New standard tuning** (bibliography §5) — the intervals and the
  regular-tuning properties. Orientation-grade; fine for arithmetic about interval
  structure, not for claims about intent.
- **Rāga Junglism — New Standard** (§5, live) — source of Steve Ball's "long stilts"
  observation, attributed to Ball via that page.
- **Stringjoy — NST explained** (§5, live) — the sauna account, September 1983, adopted
  1985. Secondary; the book should confirm. TODO(guitar-circle)
- **Fripp, *The Guitar Circle*** (§1, 🛒 ordered from DGM, not yet arrived) — the
  authorised text on the teaching. Every claim above marked `TODO(guitar-circle)` gets
  re-verified against it; `grep -rn "TODO(guitar-circle)"` is the revision checklist
  (Plan-001 §1).
- **Wikipedia — Guitar Craft** (§5) — orientation only.

## Claims requiring the editorial mark

- **The chapter's framing** — "a harmonic theory implemented in hardware" — is our
  analysis, not Fripp's description. One page-level mark, as on Part I.
- **The resonance claim** (outline step 5): *stacked fifths bias the hand toward exactly
  the harmony a feedback loop can survive.* [Content methodology §2](../architecture/content-methodology.md#2-three-kinds-of-claim-marked-differently)
  names this one explicitly as mark-required. The mark covers the *bias* — which the
  two fretboards demonstrate — and per ADR-003 it carries **no citation**.

Note the split, because it is easy to collapse: the mark covers **our claim that the
resonance exists** (demonstrable, ours, marked, uncited). The **historical question of
intent** is not an editorial claim at all — it is a hedged unknown, handled below. One
sentence asserting "the tuning suits the loop, and Fripp knew it" would break both
rules at once.

## Claims that stay hedged

- **Whether Fripp connected the fifths tuning to the harmonic demands of loop playing.**
  On the methodology's hedged list verbatim: **state as a question.** The page asks it
  and does not answer it. If *The Guitar Circle* answers it either way, the claim moves
  from hedged to *sourced fact with citation* — never to editorial. TODO(guitar-circle)
- Whether the high-B impracticality is Fripp's own stated reason for the top minor
  third, or the standard explanation attached later. The physics is fact; the
  attribution is hedged. TODO(guitar-circle)

## Rights notes

- **Fretboard diagrams of a tuning are fine.** A tuning is six pitches — a fact about
  how an instrument is set up, not a composition. A diagram of open-string pitches and
  generic interval shapes is neither a transcription nor a derivative work of any piece.
  ADR-031 bites only if a *part* appears on the fretboard: **no preset or example may
  spell a King Crimson figure or Guitar Craft repertoire**, and the interval-name
  display vocabulary makes that structurally hard, not merely policed.
- "Long stilts" is a two-word attributed quotation — trivially within the ~50-word
  budget, and not an aphorism, so the site-wide cap of four (ADR-030) is untouched.

## Acceptance criteria

- [ ] A reader drags one shape across string sets and sees it keep its interval content
      in NST and lose it in standard tuning (the page-spec acceptance).
- [ ] The resonance with chapter 3.2 is presented **as a question**; nowhere does the
      page assert Fripp's intent.
- [ ] The editorial mark is present at page level; no editorial claim carries a
      citation; the mark/hedge split above survives editing.
- [ ] No preset spells any King Crimson or Guitar Craft material; display is interval
      names, never tab.
- [ ] Every Guitar Craft–sourced assertion carries `TODO(guitar-circle)` until checked
      against the book.
- [ ] The chapter makes its point with audio disabled (the fretboards are visual;
      sounding the voicings deepens, never carries).
