---
title: "Cycles engine"
last_updated: 2026-08-11
related_adrs: ["015", "016", "017", "018", "031"]
---

# Cycles engine

The second engine. Where the Rig models one cycle running against your phrase, this
models N cycles running against each other.

Carries Part I (the thesis) and chapter 8 (rhythm). Absorbs the existing
five-against-seven page as a preset.

---

## 1. What it is for

The thesis in playable form. It must make three things audible and visible:

1. **A shared pulse with different cycle lengths produces a finite orbit** that returns
   exactly, at the LCM.
2. **Different tempos produce no return at all**, ever.
3. **These are different objects**, and confusing them is the standard error.

Point 3 is the site's clearest contribution and is enforced structurally: the LCM grid
is **disabled in drift mode**, because there is nothing to come home to
([D-016](../decisions/016-offset-and-drift-separate-modes.md)).

---

## 2. Model

```ts
interface Voice {
  name: string
  cycle: number        // integer, 1–32
  hits: number[]       // indices within the cycle
  rate: number         // 1 in offset mode; ≠1 is what makes drift drift
  timbre: { freq: number; tone: number }   // generic, see §6
  muted: boolean
  colour: string
}
```

A voice is a cycle length plus a set of positions within it. That is the whole model,
and its smallness is the point — the same three fields describe a clapping exercise, a
guitar part in 15/16, and a drum cycle of seventeen.

### Modes

| | Offset | Drift |
|---|---|---|
| `rate` | all voices `1` | voices differ |
| Pulse | one shared | one per voice |
| Return | exact, at `lcm(cycles)` | none |
| Grid view | available | **disabled** |
| Primary view | grid | dials |

---

## 3. Derived quantities

All pure, all unit-tested, none touching audio.

```
returnPulses(voices)        = lcm of all cycle lengths
pulsesToSeconds(n, bpm)     = n * 60 / bpm
coincidences(voices, span)  = indices where every sounding voice hits
longestGap(voices, span)    = max interval between consecutive coincidences
longestInterlock(...)       = longestGap - 1
density(voices, span)       = fraction of pulses on which anything sounds
driftBeatSeconds(cycle, bpm, rateA, rateB) = cycle*60 / (bpm * |rateA-rateB|)
```

### The `longestGap` / `longestInterlock` convention

**This has already caused one inconsistency and must not cause another.**

- `longestGap` is the **interval** between coincidences. For five against seven: **18**.
- `longestInterlock` is the **count of beats between** them, on which nothing agrees:
  **17**.

The second is the musically meaningful figure — it is how long you are on your own — and
it is what the existing five-against-seven page already prints. **The UI prints
`longestInterlock`.** Both are exported because the interval is what you want for
arithmetic ([D-018](../decisions/018-longest-interlock-printed.md)).

### Worked values, for test fixtures

| Preset | Cycles | Return | Coincidences | Interlock |
|---|---|---|---|---|
| Five against seven | 5, 7 | 35 | 6 | 17 |
| Discipline | 15, 14, 17 | **3570** | 1 | 3569 |
| Discipline, guitars only | 15, 14 | **210** | 1 | 209 |
| Frame by Frame | 7, 6 | 42 | 1 | 41 |
| Thela Hun Ginjeet | 7, 8 | 56 | 1 | 55 |
| Indiscipline | 15, 8 | 120 | 1 | 119 |

The two numbers the chapter is built on: **the guitars realign every 210 sixteenths
(≈48 s), but all three parts agree only once every 3570 — about 13½ minutes, longer than
the track.** A listener never hears the full resolution. That is worth stating plainly.

---

## 4. Views

One canvas, three render functions.

### Grid — the explanatory view

The pulse laid out one cycle per row. Voice one goes vertical; every other voice leans
across the grid as a set of slants, coming home only at the bottom.

- Columns = voice one's cycle. Rows = `lcm(v1, v2) / v1.cycle`.
- Voice one hit → brass fill. Voice two → aqua ring. Both → unison fill. Third voice →
  a small mark, so it reads as present without competing.
- Current pulse outlined.
- **Disabled in drift mode.**
- Above ~1200 cells, refuse to draw and say why rather than rendering mush.

All presets fit: 5×7, 15×14, 7×6, 7×8, 15×8.

### Ribbon — the time view

Lanes left to right, one per voice, bar lines at cycle boundaries, coincidences as
vertical rules, playhead. Span capped at 120 pulses; if the return is longer, say so
on the canvas rather than silently truncating.

### Dials — the drift view

One dial per voice, each turning once per its own cycle, hit marks on the rim. The only
view that survives drift: you watch two hands separate, and no arithmetic will bring
them back.

Hit feedback is an **expanding ring, not a filled disc** — a disc large enough to read
swallows the rim marks it is meant to point at.

---

## 5. Presets

| id | Mode | Cycles | Pulse | Source |
|---|---|---|---|---|
| `claps` | offset | 5 (1,4) · 7 (1,4,6) | 84 | Dublin keynote, 4 Aug 2025 |
| `discipline` | offset | 15 · 14 · 17 | 264 | *Discipline*, 1981 — meters only |
| `frame` | offset | 7 · 6 | 190 | "Frame by Frame" — meters only |
| `thela` | offset | 7 · 8 | 200 | "Thela Hun Ginjeet" — meters only |
| `indiscipline` | offset | 15 · 8 | 210 | "Indiscipline" — meters only |
| `drift` | drift | 8 · 8 at ×1.00 / ×1.04 | 132 | The Reich case |

Tempos are chosen for **audibility, not fidelity** — *Discipline*'s sixteenths run at
roughly 480/min on the record, which is too fast to hear the interlock as an interlock.
The page must say so rather than implying the preset is the tempo.

---

## 6. Rights constraints on this engine

**Meters only.** [D-031](../decisions/031-no-transcriptions-or-tab.md)
and [D-017](../decisions/017-meters-never-parts.md).

Concretely:

- A King Crimson preset carries **a cycle length and a downbeat**. Nothing else.
- Timbres are **generic strikes** distinguished by register alone — enough to tell voices
  apart, not enough to constitute a line.
- Any pattern beyond the downbeat is **built by the user** in the rack.
- The guarantee is **printed on the page**, not just recorded here.

A cycle length and a downbeat are public analytical fact — the sort of thing a review
prints. A pattern of hits is a composition. The line is drawn there deliberately.

---

## 7. Audio

Shares the site's single `AudioContext`
([D-015](../decisions/015-one-audiocontext.md)).

Percussion is simple enough that it does **not** need quiver: a short pitched triangle
component plus band-passed noise, mixed by a `tone` parameter. Deliberately not routed
through the tape engine — this engine is about time, not decay.

Scheduling per [Audio engine §7](audio-engine.md#7-scheduling-and-timing): 25 ms timer,
120 ms lookahead, paint events drained when heard. Each voice schedules independently
from its own `rate`, which makes offset and drift the same code path with different
numbers.

---

## 8. Interaction

- **Rack**: per voice, cycle stepper, hit toggles, mute. Editing is the point — the
  engine is a research instrument as well as an illustration. v2 §5 item 13 suggests
  loading the published *Discipline* meters into it to check whether the sequence is
  internally coherent; that is a real use.
- Editing a preset **clears the preset label**, because it no longer describes what is
  playing.
- Space toggles transport. Full keyboard operation required.
- Canvas carries an `aria-live` textual summary — see
  [Accessibility §4](accessibility-and-interaction.md).

---

## 9. Known gaps

- **Canvas has no semantics.** The `aria-live` summary is a floor, not a solution. An
  SVG grid with real elements would be better and is not yet costed.
- **Drift with more than two voices** has no meaningful "one full cycle of drift"
  readout; currently computed pairwise on the first two.
- **Tempo changes mid-run** retime in place rather than restarting, which is correct, but
  the drift readout does not animate the change.
