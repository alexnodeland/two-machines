---
title: "Information architecture"
last_updated: 2026-08-11
related_adrs: ["005", "029", "031", "034", "035"]
---

# Information architecture

Every page, its URL, its size budget, its interactive, its sources.
Constrained by [Thesis and scope](../proposals/001-two-machines-website.md).

All URLs are relative to the `pathPrefix` `/two-machines`
([D-029](../decisions/029-github-pages-pathprefix.md)).
Never hand-write them — always `Link` or `withPrefix`.

---

## 1. Site map

```
/                          Part 0 · The Instruments (the Rig, above everything)
/two-cycles                Part I  · the thesis
/machine/
  /machine/what-it-is                1 · What it is
  /machine/where-it-came-from        2 · Where it came from
  /machine/what-the-tape-does        3 · What the tape does to your music   NEW in v2
  /machine/the-grammar               4 · The grammar          (6 lessons, own anchors)
  /machine/the-four-modes            5 · The four modes
  /machine/building-it               6 · Building it          (4 tiers, own anchors)
/discipline/
  /discipline/where-the-numbers-come-from   7 · Gurdjieff, Bennett, objective art  NEW
  /discipline/rhythm                        8 · The interlock                       NEW
  /discipline/harmony                       9 · The tuning as embedded theory       NEW
  /discipline/melody                       10 · Perpetuum mobile, distributed line  NEW
/the-room                  Part IV · philosophy
/listen                    Part V  · annotated curriculum
/sources                   Part VI · bibliography
/cycles                    the Cycles engine, full-page
/colophon                  what this is, who made it, non-affiliation, contact
```

### Reading order vs. file order

The nav presents **The Room early** — after Part I, before The Machine — per
[RFC-001 §4](../proposals/001-two-machines-website.md#4-structure). Readers arrive sideways from search, the
philosophy chapter is cheap to read, and it frames everything. The URL structure does
not encode reading order; the nav does.

---

## 2. Page specifications

Each page below fixes: its **one idea**, its **interactive** and that interactive's
size budget (see [Design system](design-system.md)), its **sources**, and its
**acceptance criterion**. Per-chapter detail documents come in the next planning pass.

---

### `/` — Part 0 · The Instruments

| | |
|---|---|
| **One idea** | The technique is a feedback system, and this page is one. |
| **Interactive** | The Rig — **L**. Running before the reader has read anything (silently; audio needs a gesture). |
| **Prose budget** | One paragraph of orientation. No more. |
| **Sources** | v1 §2.2 |

Below the fold: a one-screen table of contents that makes the two halves legible, and
the non-affiliation line.

**Acceptance:** a first-time visitor drags the machines apart and hears the delay change
within 15 seconds, without reading anything.

---

### `/two-cycles` — Part I · the thesis

| | |
|---|---|
| **One idea** | Two cycles of incommensurate length, and the two different ways they fail to line up. |
| **Interactive** | The Cycles engine — **L**, embedded. Three presets stepped through inline: 5-vs-7 claps, 15-vs-14, phrase-vs-delay. |
| **Prose budget** | ~800 words. Short on purpose. |
| **Editorial mark** | **Required** — this is the site's own claim. |
| **Sources** | v2 §0, §1.1 |

Must establish, in this order: shared pulse → different cycle lengths → LCM →
realignment → **the drift/offset distinction**. Everything later refers back here.

**Acceptance:** a reader can state why five against seven returns at 35, and why two
tempos never return at all.

---

### `/machine/what-it-is` — 1 · What it is

| | |
|---|---|
| **One idea** | One reel of tape crosses from the left deck to the right; the right one's output is wired back into the left. |
| **Interactive** | **XS** — inline live delay-time readout, reflecting the Rig's current state. |
| **Diagram** | Descendant of Eno's *Discreet Music* schematic. Must be drawn from the real sleeve, not from memory — see [Open questions](open-questions.md). |
| **Sources** | Gaskin interview; *Discreet Music* liner notes; Fripp's "interstice" definition |

Must carry Fripp's own caveat: **it is not strictly a loop.** The tape runs machine to
machine and does not return; it behaves as a loop only because the *signal* is fed back.

**Acceptance:** the mechanism is explained in four sentences and one diagram.

---

### `/machine/where-it-came-from` — 2 · Where it came from

| | |
|---|---|
| **One idea** | Fripp did not invent this, has never claimed to, and neither did Eno. |
| **Interactive** | **S** — horizontal timeline, each node expandable. |
| **Sources** | Schaeffer/Poullin morphophone; Conrad 1961; Riley 1963; Oliveros 1966; Eno 1972/1975; Fripp/Walton 1977 |

Lands Schellinx's point: it does not make much sense to name an originator — this
arrived with the machine. Riley's **Time Lag Accumulator** is introduced here and
recurs in chapter 3 as the more accurate name.

**Acceptance:** the chain is correct and non-hagiographic. This is a credibility gate
([D-005](../decisions/005-non-hagiographic-lineage.md)).

---

### `/machine/what-the-tape-does` — 3 · What the tape does to your music · **NEW**

The intellectual centre of the Machine half. Three sub-sections, three interactives.

| | |
|---|---|
| **One idea** | The delay line is not a neutral effect; the Frippertronics idiom is an adaptation to its constraints. |
| **Editorial mark** | **Required throughout.** v2 §1.4 is explicit that these framings are ours. |
| **Sources** | v2 §1.1–1.4; Winnipeg 1979 (E minor/G minor collision); *Michigan Daily* 14 June 1979 (overtones); Monograph III harmonic-series aphorism |

**3.1 Rhythm — a perpetual canon at a fixed interval.**
Interactive: **M**, `m-canon.html` prototype. Phrase length against *T*; divides evenly →
phase-locked canon; otherwise → accumulation. Explicitly the same arithmetic as Part I.

**3.2 Harmony — harmonic rhythm is a function of the feedback knob.**
Interactive: **M**, not yet prototyped. The system is additive-only: you cannot remove
anything, only wait for decay. So the *rate at which you may change harmony* is bounded
by decay time. This is why the repertoire is modal and pedal-point-based — a constraint
of the mechanism, not a stylistic preference.
Carries: the deliberate bitonality (E minor against G minor, which Fripp calls
exquisite, using the word *interstice* — the same word as in his definition of
Frippertronics); spectral rather than chordal thinking; and the Monograph III
harmonic-series statement as the theoretical justification for "avoid mud".

**3.3 Melody — sustain governs gesture.**
Interactive: **M**, `m-beeping-droning.html` prototype (beeping/droning + mud meter).
The deeper point, and the chapter's payoff: **the tape enforces a hard split between
melody and harmony.** What you commit to the loop becomes harmony; what you play over
it stays melody. The two-volume-pedal technique is the *mechanism* of that split.

**Acceptance:** a reader can explain why fast lines become mud, and why the two pedals
are not a trick.

---

### `/machine/the-grammar` — 4 · The grammar

Six lessons, each an anchor, each deep-linking the Rig with a preset.

| # | Lesson | Size | Prototype |
|---|---|---|---|
| 1 | Three notes and silence | **S** | `s-three-notes.html` ✅ |
| 2 | Beeping and droning | **M** | `m-beeping-droning.html` ✅ |
| 3 | **Not committing** — the two-pedal split, the record head, delay-off-with-trails | **S** | — |
| 4 | Avoiding mud — overload it deliberately, then pull back | **S** | (mud meter exists) |
| 5 | Volume swells and soft attack | **S** | — |
| 6 | Writing a structure — the sequence-plan format | **M** | — |

Lesson 3 is the most important on the site and currently has no exercise. Lesson 6 is
the capstone: write a sequence plan (organ drone in D; high glockenspiel; improvise in
D minor; when the drone fades move to A or E minor; return to D) so the form is fixed
and the content is free.

**Sources:** Norman Lamont parts 1–2 — the only decent published method found.

**Acceptance:** each lesson deep-links a preset and works with no guitar.

---

### `/machine/the-four-modes` — 5 · The four modes

| | |
|---|---|
| **One idea** | Four named things, distinguished by what changes in the signal path. |
| **Interactive** | **S** — signal-path diagram that morphs between the four. |
| **Sources** | v1 §1.5. Tamm is the sole source for the *Sacred Songs*-was-first claim and **must be obtained** before this ships. |

Pure · Applied · Discotronics · Soundscapes. Each: what changes, two listening examples.
Must carry Fripp's insistence that the Fripp & Eno records are *not* Frippertronics.

---

### `/machine/building-it` — 6 · Building it

Four tiers, concrete numbers, no vibes. Anchors per tier.

- **Pedalboard** — minimum kit (electric guitar, distortion, volume pedal, one long
  decaying delay); 4–8 s delay, feedback ~75%; **delay off with trails engaged is the
  digital equivalent of lifting the record head**, taught as such; the RC-300 aux
  routing; the ping-pong doubling trick; the Red Panda Tensor MIDI caveat.
- **DAW / patch** — the three-track routing; Max `Long_loop` (`tapin~`/`tapout~` + feedback
  gain, framed in the docs as the two-tape-machine technique); Pd `delwrite~`/`vd~` with a
  `line~` ramp to avoid clicks.
- **Code** — a small implementation, MIT-licensed, that *is* the site's engine. Now:
  quiver + AudioWorklet ([D-035](../decisions/035-quiver-patch-audioworklet.md)).
- **Tape** — the real thing, honestly costed. Two decks, splicing, the simultaneous pause
  release, monitoring for sync. Signs & Symptoms as the field report.

**Interactive:** **S** per tier — a settings card showing the same parameters translated
into that tier's vocabulary.

---

### `/discipline/where-the-numbers-come-from` — 7 · **NEW**

| | |
|---|---|
| **One idea** | Fripp's interest in cyclic number is doctrinally sourced, not decorative. |
| **Interactive** | **S — the octave and its two gaps.** See below. |
| **Sources** | Robertson 2017 (peer-reviewed, open access) — chapter depends on it |

Short and cool-headed. Bennett at Sherborne House, 1975–76; Bennett a student of
Gurdjieff; the Law of Seven and the Law of Three. Report that the interest is sourced,
point at Robertson for the argument, get back to the music.
**Do not** over-explain the esotericism or sneer at it. Cite Robertson's summaries
rather than Gurdjieff directly ([D-034](../decisions/034-cite-robertson-not-gurdjieff.md)).

The fact worth the chapter: **"Heptaparaparshinokh" is the A-side of a 1980 League of
Gentlemen single, and its B-side "Marriagemuzic" is a standalone Pure Frippertronics
piece.** Both halves of this site on one piece of vinyl.

### The interactive — and the line it must not cross

**The Law of Seven** (*Heptaparaparshinokh*, also "the Law of Octaves") holds that every
process unfolds like an ascending octave — do re mi fa sol la si do — and that the octave
contains **two places where the step is a semitone rather than a tone: mi→fa and si→do**.
Gurdjieff read those two gaps as the points where any process naturally deflects unless an
external "shock" is applied. The named intervals are *stopinders*. With the Law of Three
superimposed, this produces the enneagram.

**The acoustic fact underneath is true.** The diatonic scale really does have its
semitones there. Gurdjieff built a cosmology on a real property of the scale, and that is
what makes an honest interactive possible.

So the S-size interactive does exactly two things, in this order:

1. **Demonstrates the true part.** Play the octave. Hear and see that mi→fa and si→do are
   half the step the others are. This is verifiable and needs no framing.
2. **Reports the doctrinal reading.** A second layer, visually distinct and behind an
   explicit toggle, labels those two gaps as Gurdjieff labelled them and states what he
   claimed about them — as *reported doctrine*, never as demonstrated.

**What it must not do**, and this is the whole reason for the care:

- It must **not** be a seven-beat cycle. Everything else playable on this site is
  demonstrably true — five against seven really does return at 35. A playable seven-cycle
  here would put a metaphysical claim on the same footing as the arithmetic.
- It must **not** imply the clapping patterns derive from the doctrine. v2 §5 lists
  *"the Law of Seven and the choice of seven-based clapping patterns: doctrinal, or
  convenient prime?"* as an **open question**. The interactive must not answer it by
  implication. A sentence stating it as open belongs on the page.
- No enneagram as ornament. If the enneagram appears, it is because the text is explaining
  the Law of Three, and it is labelled as doctrine.

Register: report, do not endorse; explain, do not sneer. Then get back to the music.

---

### `/discipline/rhythm` — 8 · **NEW**

The heaviest interactive chapter.

| | |
|---|---|
| **One idea** | The clapping exercise and the *Discipline* interlock are the same object at different scales. |
| **Interactive** | The Cycles engine — **L**, with all offset presets. |
| **Rights** | **Meters only.** [D-031](../decisions/031-no-transcriptions-or-tab.md), guarantee printed on the page. |
| **Sources** | Dublin keynote 2025; the published meter sequence (needs a third independent source); *Bruford and the Beat* |

Three sections: the counting and clapping exercises · Guitar Craft circulations (the
collective analogue of the delay line — the loop is the circle, the delay is one seat's
worth of time) · the *Discipline* interlock.

Two things said loudly: **this is not Reich phasing**, and **it is the same object as
the clapping exercise**.

The generative device is startlingly simple: one player takes the other's phrase and
cuts the last note.

**Acceptance:** a reader sees that the two guitars realign every 210 sixteenths while all
three parts agree only once every 3570 — longer than the track — without doing arithmetic.

---

### `/discipline/harmony` — 9 · **NEW**

| | |
|---|---|
| **One idea** | New Standard Tuning is a harmonic theory implemented in hardware. |
| **Interactive** | **M** — two fretboards, standard against C–G–D–A–E–G; drag a shape across string sets. |
| **Sources** | NST references; Steve Ball's "long stilts"; Guitar Craft |

C2–G2–D3–A3–E4–G4: four stacked perfect fifths with a minor third on top, because a high
B is impractical at guitar scale length. Consequences: quintal and quartal voicings
become the default; close thirds-based triads become awkward; voicings are wide by
construction; as a **regular tuning**, shapes transpose across string sets in a way
standard tuning's lone major third prevents.

Note the resonance with chapter 3.2 — stacked fifths bias you toward exactly the open,
non-functional, spectrally clean harmony a feedback loop can survive. **Whether Fripp
intended that connection is unknown and must not be asserted**; put it in front of the
reader as a question.

---

### `/discipline/melody` — 10 · **NEW**

| | |
|---|---|
| **One idea** | Continuous line, and line distributed across bodies. |
| **Interactive** | **M** — circulations, reusing the Cycles dials view. |
| **Sources** | Guitar Craft picking material; Sustainer-era rig notes |

**The thinnest chapter on the site, and it must say so.** v2 §2.4 concedes it needs the
most original work, and that work — interviewing living crafties — is out of scope for
v1 ([RFC-001 §5](../proposals/001-two-machines-website.md#5-scope-boundaries)). Honesty about a gap beats
padding it.

Cross-picking and perpetuum mobile; the Sustainer as the point where the *instrument*
absorbs a function the *rig* used to provide; the ergonomics-first picking approach,
which connects directly to why Fripp was at an Alexander Technique congress at all.

---

### `/the-room` — Part IV · philosophy

| | |
|---|---|
| **One idea** | Listening is an act of attention; hearing is passive. |
| **Interactive** | none. Let the prose carry it. |
| **Sources** | Tooley interview 1979; Midnight Special 1979 |

Active listening versus passive hearing — the philosophical spine, and the one verbatim
quotation that must appear. The proposition of hazard. Record shops, pizzerias and a
planetarium, so nobody is owed the hits. The small, mobile, intelligent unit — as much a
business-model argument as a musical one.

Short. Fripp's own sentences do the work.

---

### `/listen` — Part V

Annotated curriculum, ordered pedagogically: *(No Pussyfooting)* → *Discreet Music* →
*Let the Power Fall* → *Exposure* → *Sacred Songs* → *"Heroes"* → The Roches →
*Gone to Earth* → *The Equatorial Stars* → *Music for Quiet Moments*. Now also needs
*Discipline* and the League of Crafty Guitarists.

Each entry: **one sentence on what to listen *for***, and a link out to a legal stream.
**Host no audio.**

---

### `/sources` — Part VI

Generated from [References](bibliography.md), which is the single source of truth.
Grouped as there. Each entry carries its last-verified date. Dead links link to a
Wayback snapshot and say so.

---

### `/colophon`

What this is, who made it, **the non-affiliation statement**, a real contact address,
the licence, and a plain statement of which claims are the site's own.

---

## 3. Cross-cutting rules

- **Every chapter that asserts an editorial claim carries the mark.** Chapters 3, 8, 9
  and Part I at minimum.
- **Every lesson deep-links an engine preset**, as URL state, shareable.
- **No chapter depends on audio to make its point.** Audio deepens; text carries.
- **Every factual claim traces to `/sources` in one click.**
- **Chapters 5 and 7 are blocked on procurement**, not writing. See
  [Roadmap](../plans/001-build-and-launch.md).
