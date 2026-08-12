---
title: "Content methodology"
last_updated: 2026-08-11
related_adrs: ["004", "030"]
---

# Content methodology

Voice, citation discipline, the chapter template, and how editorial claims are marked.

The site's credibility rests on being *visibly* careful. This document is how that is
operationalised so it does not depend on remembering.

---

## 1. Voice

Written for a musician who is intelligent, impatient, and has read the Wikipedia page.

**Do:**
- Lead with the mechanism. Explain by making something happen.
- Use numbers. "4–8 seconds, feedback around 75%" beats "a long, lush delay."
- Use the physical vocabulary — record head, playback level, machine distance — not the
  DSP vocabulary. Name the thing, then say what it is underneath.
- Let Fripp's own sentences carry the philosophy. He is arch and quotable; paraphrase
  flattens him.
- Say what you do not know.

**Don't:**
- Hagiography. Fripp did not invent this and has never claimed to.
- Sneering at the esoteric material either. Report that the interest in cyclic number is
  doctrinally sourced, point at Robertson, move on.
- Gear-review register. No "lush," "shimmering," "sonic palette."
- Padding a thin chapter. Chapter 10 is thin and says so.
- Explaining the joke. "Frippertronics" was chosen partly because it was silly; note it
  and move on.

### The one-sentence test

Every section answers: *what can the reader now do, or hear, that they could not before?*
If the answer is "know a fact about Robert Fripp," it belongs in Part V or the
bibliography, not in a chapter.

---

## 2. Three kinds of claim, marked differently

This is the core of the methodology. v2 §1.4 asks for the boundary between sourced fact
and our analysis to stay visible; making it a typographic system rather than a habit is
what makes it survive editing.

| Kind | Example | Treatment |
|---|---|---|
| **Sourced fact** | The Kitchen debut was 5 February 1978 | Citation link to `/sources` |
| **Quotation** | "A person who listens exerts an act of attention" | Blockquote, attributed inline, linked |
| **Our analysis** | A delay line is a perpetual canon | **Editorial mark**, no citation |

**An editorial claim must never carry a footnote**, because a footnote implies a source
for a claim that has none. This is the single easiest way to accidentally launder our
opinion into apparent fact.

### The editorial mark

A visible chip — *"Our framing, not Fripp's"* — rendered by an `EditorialMark`
component. Required on: Part I, chapter 3 throughout, chapter 8's "same object at
different scales" claim, and chapter 9's tuning/loop-harmony resonance.

The mark is **not an apology**. A guide honest about which claims are its own is more
trustworthy, not less.

### Claims that must stay hedged

Some things we genuinely do not know, and the prose must not resolve them:

- Whether Fripp connected the fifths tuning to the harmonic demands of loop playing.
  **State as a question.**
- Whether the canon framing is something he would recognise.
- Whether the seven-based clapping patterns are doctrinal or a convenient prime.
- The *Discipline* meter sequence, which rests on **one** independent source.
- The *Sacred Songs*-was-first claim, which rests **solely on Tamm** and must be
  attributed to him rather than stated flatly.

---

## 3. Chapter template

Every chapter document in `planning/chapters/` follows this, and the next planning pass
produces one per page in
[Information architecture](information-architecture.md).

```markdown
# Chapter N · Title

## One idea
[a single sentence]

## What the reader can do afterwards
[the one-sentence test]

## Outline
[section headings with a line each]

## Interactive
Size · component · preset · what it teaches · what it must not imply

## Sources
[entries from 12-references.md, with what each supports]

## Claims requiring the editorial mark
## Claims that stay hedged
## Rights notes
## Acceptance criteria
```

---

## 4. Citation discipline

- **Every factual claim links to `/sources` in one click.**
- `/sources` is generated from [References](bibliography.md). Nothing is cited that
  is not in that file.
- Each entry carries a last-verified date. Dead links point to a Wayback snapshot and say
  so.
- **Deep-link rather than reproduce.** Link the Elephant Talk wiki and the substack;
  do not mirror them.
- Quote sparingly, paraphrase mostly, attribute always.

### Quotation budget

Rule of thumb: **no more than ~50 words of continuous quotation from any single source**,
and never enough that a reader could skip the source. The two exceptions, both short and
both load-bearing, are the listening/hearing passage and the interstice definition.

**Aphorisms are capped at four across the entire site**
([D-030](../decisions/030-no-aphorism-database.md)), each in context,
attributed, linked. Not five. Not "a few more if they fit."

---

## 5. Structural conventions

- **Numbers are tabular** everywhere, in prose readouts as well as instruments.
- Tape speeds as fractions with the proper glyphs: 7½ ips, 3¾ ips.
- Delay times to two decimals in readouts, one in prose.
- Dates in full on first use: *5 February 1978*.
- Album titles italic; track titles in quotation marks.
- "Frippertronics" capitalised, used descriptively, never as the site's brand
  ([D-004](../decisions/004-descriptive-title.md)).

---

## 6. Diagrams

- **Inline SVG**, themed with the design tokens. No raster images, no image pipeline
  ([Tech stack §4](tech-stack.md#plugins)).
- The hero schematic descends from Eno's *Discreet Music* liner drawing and must be drawn
  from the actual sleeve — **not reconstructed from memory**. Currently blocked; see
  [Open questions](open-questions.md).
- Colour follows the semantics in [Design system §2](design-system.md#2-colour-is-semantic): a
  record path is brass, a playback path is aqua, in a diagram exactly as in an instrument.
- Every diagram has a text alternative that conveys the same relationship, not a
  description of the picture.

---

## 7. Writing order

Deliberately not chapter order:

1. **Part I (the thesis)** first. Writing it will show whether the thesis survives
   contact with prose — and if it does not, everything downstream changes.
2. **Chapter 3** next. The intellectual centre of the Machine half and the chapter most
   likely to need restructuring.
3. **Chapters 1, 2, 4.** Well-sourced, low-risk.
4. **Chapters 7–10**, once Tier 1 sources are in hand.
5. **Chapters 5, 6.**
6. **Part IV** late, once we know which quotations have been used.
7. **Part V and `/sources`** last.

Rationale for Part IV late: it is built from quotation, and the quotation budget in §4 is
a whole-site constraint. Writing it last means we know what remains.

---

## 8. Review checklist

Per chapter, before it is considered done:

- [ ] One idea, stated in one sentence
- [ ] Passes the one-sentence test
- [ ] Every factual claim has a citation resolving to `/sources`
- [ ] Every editorial claim carries the mark and **no** citation
- [ ] Hedged claims are still hedged
- [ ] Quotation within budget; aphorism count still ≤4 site-wide
- [ ] The interactive has a preset and works with no guitar and no microphone
- [ ] The chapter makes its point with audio disabled
- [ ] No hosted audio, no tab, no reproduced aphorism
- [ ] Numbers tabular; dates and titles per §5
- [ ] Diagram has a real text alternative
