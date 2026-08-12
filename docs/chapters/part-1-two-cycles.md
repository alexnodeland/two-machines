---
title: "Part I · Two Cycles"
page: /two-cycles
last_updated: 2026-08-11
related_adrs: ["001", "003", "016", "017", "018"]
---

# Part I · Two Cycles

## One idea

Two cycles of incommensurate length running against a shared pulse must realign — and
there are two different ways for cycles to fail to line up, only one of which ever
resolves.

## What the reader can do afterwards

State why five claps against seven return together at 35, and why two independent
tempos never return at all. Everything else on the site refers back to this
distinction.

## Outline

Prose budget ~800 words (page spec). Short on purpose: the interactive carries the
demonstration, the prose only names what was heard. The argument must land in exactly
this order, because each step is meaningless without the last:

1. **A shared pulse.** Two people clap the same beat. Nothing interesting yet — this
   establishes the one thing the whole site assumes: a common clock. *(One sentence of
   prose; the Cycles engine running the trivial 1-vs-1 case, or simply the count-in.)*
2. **Different cycle lengths.** One claps every 5, one every 7. Now the downbeats
   wander away from each other. The reader plays this before reading anything about it.
3. **The return.** At 35 — the least common multiple — the downbeats meet again. Not
   approximately: exactly, and provably. Let the reader count it, then print the
   arithmetic. Along the way, 17 beats pass on which *nothing* agrees — the interlock,
   the stretch where you are on your own (the UI prints `longestInterlock`, ADR-018).
4. **Realignment is the event.** The return is audible and *felt* — the room lands
   together. This is the object the site keeps finding: in the clapping room, between
   two guitars, between a phrase and a span of tape.
5. **The drift/offset distinction** (ADR-016). The hinge of the chapter, and the reason
   the Cycles engine has two modes:
   - **Offset:** same pulse, different cycle lengths. Realignment is guaranteed, at the
     LCM. This is the clapping exercise, and it is *Discipline*.
   - **Drift:** different pulses — two tempos. If their ratio is irrational (and free
     tempos effectively are), the cycles beat against each other and **never** return.
     The grid is disabled in drift mode because there is no shared grid to draw; that
     is not a UI limitation but the point.
   A tape delay belongs to the *offset* family only when your phrase divides the loop
   time; otherwise your playing drifts against a fixed cycle that never negotiates.
   That one sentence is the bridge to Part II and is stated here, not there.

## Interactive

| | |
|---|---|
| Size | **L** — the Cycles engine, embedded (the full-page version lives at `/cycles`) |
| Component | `<Cycles>` |
| Presets, stepped inline | `five-v-seven` (5, 7 — return 35, interlock 17) → `discipline-guitars` (15, 14 — return 210) → `phrase-v-delay` (a phrase length against a delay time, offset vs. drift toggled) |
| What it teaches | shared pulse → LCM → realignment → the drift/offset distinction |
| What it must not imply | that drift resolves eventually (it does not); anything about the *Discipline* parts beyond meters (ADR-017 — cycle length and downbeat only, never a pattern) |

The three presets are stepped through *inline in the prose order* — the reader meets
5-vs-7 at step 2–3, 15-vs-14 at step 4 as a foretaste of chapter 8, and
phrase-vs-delay at step 5 as the bridge to the Machine half.

Worked values used by prose and tests come from
[Cycles engine §3](../architecture/cycles-engine.md#worked-values-for-test-fixtures):
5,7 → return 35, coincidences 6, interlock 17. The prose prints **17** (what you live
through), never 18 (the arithmetic interval) — two pages quote this number (ADR-018).

## Sources

- **v2 §0, §1.1** (the client brief) — the thesis framing itself. The brief is the
  *origin* of the claim, not a citation for it: the claim is ours and wears the mark.
- No external sources are required by this chapter, and none should be added. Factual
  arithmetic (LCM) needs no citation; the musical claim is editorial by design.

## Claims requiring the editorial mark

- **The chapter.** The recurring-object thesis — "the recurring object across Fripp's
  music is two cycles of incommensurate length, and what happens when they realign" —
  is the site's own framing (ADR-001, ADR-003). The mark appears at the top of the
  page, phrased as *"Our framing, not Fripp's"*, and is **not** repeated per paragraph;
  one page-level mark, because the whole page is the claim.
- The "tape delay is a member of the offset family" bridge sentence.

Per ADR-003, none of these carry a citation — a footnote here would launder the
framing into apparent fact.

## Claims that stay hedged

- Whether Fripp would recognise this framing. Never asserted; the mark carries it.
- Nothing else — the chapter otherwise contains only arithmetic, which is why it can
  be short.

## Rights notes

- The 15-vs-14 preset is **meters only** (ADR-031): cycle lengths and downbeats. No
  pitch material, no pattern, no tab. The engine cannot express more than meters, which
  is the structural guarantee ADR-017 asks the page to print.
- No quotation appears in this chapter; the aphorism budget (ADR-030) is untouched.

## Acceptance criteria

- [ ] A reader can state why 5-vs-7 returns at 35 and why two free tempos never return
      (the page-spec acceptance).
- [ ] The drift/offset distinction is demonstrated, not merely described — the grid
      visibly disappears in drift mode.
- [ ] The prose stays under ~800 words and never restates what a preset demonstrates.
- [ ] The editorial mark is present at page level; no editorial claim carries a
      citation.
- [ ] The interlock figure printed is 17.
- [ ] The chapter makes its point with audio disabled (the grid view carries it).
