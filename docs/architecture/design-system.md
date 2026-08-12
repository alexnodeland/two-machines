---
title: "Design system"
last_updated: 2026-08-11
related_adrs: ["020", "021", "022", "023"]
---

# Design system

Tokens, type, colour semantics, the size ladder, the spine.

---

## 1. Direction

The temptation is beige-tape-nostalgia, and it is refused
([D-023](../decisions/023-not-beige-tape-nostalgia.md)). Every ambient-guitar
site already looks like that.

The reference set is the subject's own materials: **the *Discreet Music* schematic,
splicing-block geometry, VU ballistics, the Revox front panel's grey-and-orange, and the
physical fact of a tape span between two points.**

Ground is deep indigo, not cream. Restraint everywhere except where a number needs to be
enormous.

---

## 2. Colour is semantic

[D-020](../decisions/020-semantic-colour.md). Every accent
answers one question: *which machine is this?*

| Token | Value | Means |
|---|---|---|
| `--brass` | `#E3A83E` | **Machine one. Record.** What you are committing to the tape. |
| `--aqua` | `#66D9DE` | **Machine two. Play.** What is coming back at you. |
| `--unison` | `#FFF6E2` | Both at once. Used sparingly enough to still land. |
| `--runaway` | `#E2564A` | Past unity. The loop is eating itself. |
| `--ink-deep` | `#0E0B30` | Ground. |
| `--ink` | `#171346` | Raised ground, for section bands. |
| `--ink-soft` | `#221D5F` | Panels, deck bodies. |
| `--ivory` | `#F3EEE3` | Figure. |
| `--paper` | `#EDE6D6` | The one light band, for human-scale chapters. |

Derived: `--ivory-dim` .60, `--ivory-faint` .28, `--ivory-ghost` .12; `--ink-line` at .16
and `--ink-line-strong` at .32.

**Applied consistently, this does real work.** A note is brass while you hold it and aqua
once it is circulating. The feedback cable under the bench is aqua, and turns red past
unity. The record-head fader is brass, the playback fader aqua. A reader learns the code
without being taught it.

A third accent, `#A99BFF`, exists **only** for a third voice in the Cycles engine. It has
no semantic meaning and must not spread.

### Contrast

All body text meets WCAG AA on its ground. `--ivory-faint` at .28 is **decorative only** —
never for text conveying information that is not also available elsewhere. Audit before
launch; the alexnodeland repo has a contrast-audit script worth reusing.

---

## 3. Type

| Role | Face | Why |
|---|---|---|
| Display | **Bricolage Grotesque** | Variable width axis; condenses for long headlines without a second face. |
| Body | **Newsreader** | Fripp's prose is arch and needs a voice. A neutral sans flattens it. |
| Mono / readouts | **Azeret Mono** | Real tabular numerals. Non-negotiable — a delay readout that shifts width while you drag is unusable. |

`font-variant-numeric: tabular-nums` on **every** numeric readout, without exception.

Self-host all three. No Google Fonts request in production: it is a third-party request
on a site whose whole posture is self-containment, and it costs a round trip on first
paint. The mockups use the CDN for convenience only.

---

## 4. The size ladder

[D-021](../decisions/021-size-ladder-budget.md).
**A size is a budget, not a description.**

| Size | What | Control budget | May appear |
|---|---|---|---|
| **XS** | Inline readout | 0 controls, no chrome | inside a sentence |
| **S** | Lesson card | ≤4 steps, 1 control surface, 1 diagnostic | between two paragraphs |
| **M** | Section band | ≤2 faders, 1 mode switch, 1 visualisation, 1 verdict | its own full-bleed band |
| **L** | Instrument | full control set, drag surface | full viewport |
| **Page** | Composed document | several sizes plus the spine | standalone |

**Anything that outgrows its budget is promoted or cut.** That constraint is the
editorial mechanism: it forces every lesson to name its single idea. A card that needs a
second row of faders is not a card.

### There are exactly two L's, one per half

The Machine gets **the Rig**. The Discipline gets **the Cycles engine**. A third L would
require a third half, which is a reason to say no.

---

## 5. The spine

[D-022](../decisions/022-the-spine.md). **One
page-level effect. There is not a second one.**

A single continuous line down the left margin, running the whole document. It is the
tape. Every section is a node on it. Its brightness tracks the running instrument's
feedback level, so the page dims and swells with what you are playing.

Rules:

- **No scroll-jacking.** Scroll position modulates nothing.
- Brightness is driven by a single CSS custom property, `--spine-heat` (0–1), set from
  the audio layer.
- Goes red past unity, matching `--runaway`.
- When no instrument is running it sits at its floor and is nearly invisible. It must
  never look broken when idle.
- Under `prefers-reduced-motion`, the value still changes but without transition.

---

## 6. Component inventory

Derived from the prototypes; each becomes a tested React component.

**Chrome:** `Spine` · `SpineNode` · `Eyebrow` · `SizeNote` (dev only) · `EditorialMark`
· `RightsNote` · `CitationLink`

**Controls:** `Fader` (label, tabular value, optional unity mark) · `Seg` ·
`Toggle` · `Pad` · `KeyStrip` · `Stepper` · `HitToggles` · `PresetRow`

**Instruments:** `Rig` (L) · `Cycles` (L) · `Canon` (M) · `BeepingDroning` (M) ·
`ThreeNotes` (S) · `MudMeter` · `Verdict` · `StatGrid` · `Bench` · `Deck` · `Ruler` ·
`Trace` · `Vu`

**Every control renders its value with tabular numerals and exposes a real accessible
name.** No exceptions.

---

## 7. Layout rules learned from the prototypes

These are recorded because each one already cost a bug:

- **`.wrap` needs `width: 100%`.** `margin: 0 auto` cancels flex cross-axis stretch, so
  inside a column flex container the wrap shrink-to-fits instead of filling. Collapsed
  the Rig's bench from 1080px to 312px.
- **Buttons need explicit `width: 100%` in grid cells.** A `<button>` is inline-block and
  shrink-to-fits; without it, key strips render as slivers.
- **Fixed grids, not flex-wrap, for pad rows.** With wrapping, the last pad drops to its
  own row and flexes full-width, reading as a control rather than a note.
- **Rulers keep a constant scale.** A scale that stretches as you drag is not a ruler.
- **Hit feedback expands, never fills.** A filled disc large enough to read obscures what
  it points at.

---

## 8. Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥ 900px | Full. Bench at full width; two-column bands. |
| 620–900px | Bands collapse to one column. Bench narrows; deck width scales down. |
| < 620px | **The bench stops teaching.** See below. |

### The mobile L — resolved: a scrollable bench at fixed scale

Below roughly 600px the drag gesture has too little travel to convey that delay time is
a distance. **Decision: keep the scale fixed and let the viewport become a window onto a
bench that is longer than the screen.** You scroll along the tape span to see the gap.

Chosen because it is the only option that preserves the claim. A seconds fader would give
phone readers the ordinary millisecond slider every other site has — abandoning the one
interaction the hero exists for, on the most common device.

Consequences that must be designed for:

- **Gesture conflict is the whole risk.** Horizontal drag on a deck must not fight
  horizontal scroll of the bench, and neither must fight vertical page scroll.
  Resolution: `touch-action: pan-y` on the bench, so vertical page scroll always wins;
  horizontal movement belongs to the instrument. Dragging a **deck** moves the deck;
  dragging the **bench background** pans the view.
- **The ruler stays true.** It is the reason for the whole approach — a scale that
  changed with viewport width would make the readout a lie.
- **The readout must stay visible while scrolled.** The seconds/centimetres tag sticks to
  the viewport rather than to the midpoint of the gap, or the number leaves the screen at
  exactly the moment you are changing it.
- **Both decks may be off-screen at long delays.** Edge indicators show which direction
  each machine lies in, and how far.
- A "fit to screen" control returns to a view containing both decks.

**Still to prototype at 375px** before Phase 6 — the decision is made, the execution is
not proven.
