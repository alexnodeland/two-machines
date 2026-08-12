---
title: "Open questions"
last_updated: 2026-08-12
related_adrs: ["002", "022", "029", "035"]
---

# Open questions

What is genuinely undecided, who decides it, and what would resolve it.

A question belongs here only if it is unresolved **and** consequential. Anything already
decided lives in [Decision log](../decisions/README.md); anything inconsequential should
just be decided.

---

## Blocking

*(Q-02, the last blocking research question, was resolved 11 Aug 2026 — see below.)*

---

## Consequential, not blocking

### Q-05 · Stereo, later
**Owner:** product

Decided mono for the Rig, which is historically right for the tape era. But Soundscapes
is emphatically stereo, and Fripp used two 2290s *specifically because each was mono* and
he wanted to manipulate the inputs separately.

Chapter 5 currently describes this rather than demonstrating it. A small stereo demo
there would teach the actual historical reason stereo appeared.
**Resolved by:** deciding whether chapter 5 gets an interactive at all.

### Q-06 · How much coaching? — **Resolved 12 Aug 2026: a site-wide voice, with one discipline**
**Owner:** design

Resolved by the prescribed method: the grammar page's lessons read in sequence
(the silence coach, the not-committing verdicts, the mud phases, the swell
arrival, the plan run). It does not grate, and the reason it does not is a rule
worth keeping explicit: **every card speaks only when a measurement changes** —
occupancy crossing a threshold, a level returning or not, a phase advancing.
No card talks on a timer except the silence coach, where the passage of time IS
the measurement. Prompting is therefore a site-wide voice, and the discipline
that licenses it is measured-then-named: a card that wants to speak must first
have something it measured. Any future card that narrates without measuring
breaks the voice.

### Q-07 · Does the ring survive? — **Resolved 12 Aug 2026: yes**
**Owner:** design

Resolved by the prescribed method: both were built, and screenshots of the two were
placed side by side (Cycles dials on `/cycles`, the loop face on grammar lesson 2).
They share only "circular"; every reading that matters differs:

- **The dials are clocks.** N small circles, one per voice; time is the angle of a
  sweeping hand; hits are dots on the rim. Angle = phase of a cycle.
- **The face is a tape seen from above.** One large annulus — two concentric circles,
  quarter spokes, a playhead; notes are arcs in the band. Angle = position on the
  tape; radius = pitch; opacity = decay.

The count differs (many-small vs one-large), the scale differs, and they never share
a page (dials: `/cycles` and chapter 10; face: grammar lesson 2 and chapter 3.3).
Against [D-022](../decisions/022-the-spine.md): neither is a page-level effect —
both are instrument-local visualisations inside their bands, and the spine keeps its
monopoly. The two rings are the coherent language the question hoped for: on the
Machine side the circle is *the tape*; on the Discipline side the circle is *the
cycle*. Both mean periodicity, which is the site's subject.

**Consequence:** the ch. 10 `circulation` preset (blocked on this) is unblocked.

### Q-08 · Approaching DGM
**Owner:** client

No longer legally necessary — non-commercial site, no book, quotations within Fripp's
stated terms ([Rights and legal §7](rights-and-legal.md#7-optional-approaching-dgm)). Still possibly
worth it as courtesy, and it would open two doors currently shut: the *Discreet Music*
diagram lineage, and imagery.
**Resolved by:** a decision on whether the upside justifies inviting scrutiny.

---

## Small, decide when reached

| | Question | Default if undecided |
|---|---|---|
| Q-09 | Does the standalone five-against-seven page survive, or is it only a Cycles preset? | Redirect it to `/two-cycles`; keep the preset. |
| Q-10 | `ComponentModel`/`ThermalModel` drift, or the explicit wow/flutter LFOs? | **Resolved 12 Aug 2026 with the default's test applied:** the explicit treatment shipped (tapeAge → rolloff/wow/hiss); the §10 A/B showed the oracle's own character is partly a gain artifact, so there is no oracle pressure to enable the component models. [Audio engine §10](audio-engine.md#10-open-items). |
| Q-11 | Is there an XS instrument at all, or is the ladder four rungs? | **Resolved 12 Aug 2026: the rung survives.** The readout was built and judged in place: it makes a cross-page claim falsifiable by the reader (move the rig, reload chapter 1, the sentence changes), which is content, not decoration. The XS ladder rung stands, population one. |
| Q-12 | Site search? | No. It is a linear argument with a table of contents. |
| Q-13 | RSS for the substack-style updates? | No. The site is a work, not a feed. |
| Q-14 | Do the mockups stay in the repo after launch? | Yes, under `mockups/`, clearly marked as superseded. They are the oracle. |

---

## Resolved since the first pass

| | Question | Resolution |
|---|---|---|
| — | Book or site primary? | **There is no book.** "Book" meant the site as a long-form work. [D-002](../decisions/002-website-not-book.md) |
| — | Staged release or one launch? | **One launch.** [RFC-001 §5](../proposals/001-two-machines-website.md#5-scope-boundaries) |
| — | Rust/WASM core? | **Quiver**, via `@quiver-dsp/wasm`. [D-035](../decisions/035-quiver-patch-audioworklet.md) |
| — | Interviews in v1? | **Out.** Chapter 10 ships thin and says so. |
| — | Domain? | **`alexnodeland.github.io/two-machines`**, so `pathPrefix` is required. [D-029](../decisions/029-github-pages-pathprefix.md) |
| — | Licence? | **MIT code, CC BY-NC-SA prose.** [Rights and legal §4](rights-and-legal.md#4-licensing) |
| — | Mono or stereo? | **Mono.** See Q-05 for the residue. |
| — | Is the Loopers Delight page dead? | **No** — live at a different path. [12 C-03](bibliography.md#c-03--the-loopers-delight-page-is-not-dead) |
| — | Can we get Tamm? | **Yes** — full text, Internet Archive, opensource. |
| Q-02 | The *Discreet Music* diagram | **Resolved 11 Aug 2026 — visually confirmed.** The Are.na candidate ([block 4229499](https://www.are.na/block/4229499), 3360×1890) IS the sleeve artwork: "Operational diagram for 'Discreet Music' / The black line indicates the signal path", with the synthesizer-with-digital-recall → graphic equalizer → echo unit chain, the record/playback tape recorders, the delay-line span, the delay return, "output stored on master tape" (the take-up spiral — the tape never returns), and the combined monitor output; the JEM Records marketing line identifies a US Obscure/EG jacket. The site's descendant is drawn (`DiscreetSchematic`, chapter 1) — same relationships, our geometry and colours. |
| Q-03 | A third *Discipline* meter source | **Substantially resolved (11 Aug 2026), in the shape the question anticipated.** Independent legs found: Fripp himself, Boston, 28 Oct 1981 ("the rhythm section is in seventeen, and the front line are in fifteen. And it varies a bit along the way") and DRUM! 2012 (the 17/16 groove). The circulated twelve-pair sequence turns out to be **Wikipedia-derived** and counts as one tertiary source. **The 14/16 for guitar two remains single-tradition**: it stays hedged (Fripp's own "it varies a bit" is the quotable hedge), with 7d Media 2025 as corroboration and the Cycles engine as the verification instrument. [Bibliography §1/§5](bibliography.md#1-primary--fripps-own-words). |
| Q-01 | The mobile L | **Scrollable bench at fixed scale.** The viewport becomes a window onto a bench longer than the screen; the ruler stays true. [Design system §8](design-system.md#the-mobile-l--resolved-a-scrollable-bench-at-fixed-scale). Execution unproven — prototype at 375px in Phase 6. |
| Q-04 | Canvas accessibility | **Rich generated descriptions, not SVG.** Tabbing 210 cells is not comprehension. Descriptions are content, generated from state, and offered to everyone. [Accessibility §4](accessibility-and-interaction.md#resolved-rich-generated-descriptions-not-svg) |
| — | *The Guitar Circle* | **Ordered from DGM; not a blocker.** Chapters 8–10 drafted without it and revised on arrival, with `TODO(guitar-circle)` markers. |
| — | Chapter 7 interactive | **Yes, an S.** Demonstrates the true acoustic fact (the octave's two semitone steps); *reports* the doctrinal reading behind a toggle. Must not be a playable seven-cycle. [Information architecture](information-architecture.md#the-interactive--and-the-line-it-must-not-cross) |
