---
title: "Chapter 2 · Where it came from"
page: /machine/where-it-came-from
last_updated: 2026-08-11
related_adrs: ["003", "004", "005", "046"]
---

# Chapter 2 · Where it came from

## One idea

Fripp did not invent this, has never claimed to, and neither did Eno.

## What the reader can do afterwards

Name the chain from the early-1950s morphophone to the Kitchen in 1978 without a hero
in it, and say why "who invented it" is the wrong question — the technique arrived
with the machine.

## Outline

The lineage runs Schaeffer/Poullin → Conrad → Riley → Oliveros → Eno → Fripp
(ADR-005). Order matters: the non-claim opens, so nobody reads what follows as a
lineage of heroes.

1. **The non-claim first.** Fripp on Eno's demonstration, verbatim: "He didn't tell me
   how it worked. I simply intuited what was happening" (Tooley 1979, verified). His
   own words, before any node.
2. **Schaeffer/Poullin — the morphophone.** Tape delay as a studio device, early-1950s
   Paris. *Node needs its own source — see Sources.*
3. **Conrad 1961.** Named in the page spec; *no bibliography entry yet — see Sources.*
4. **Riley 1963 — the Time Lag Accumulator.** Two tape machines, one reel between
   them: the same topology under the more accurate name. Introduced here; recurs in
   chapter 3 as what the machine actually does.
5. **Oliveros 1966.** Tape-delay feedback played as an instrument. *Node needs its own
   source — see Sources.*
6. **Eno 1972/1975.** The system in Eno's hands: side one of *(No Pussyfooting)*, from
   the 1972 session with Fripp, and the *Discreet Music* schematic (1975) that
   chapter 1's diagram descends from.
7. **Fripp 1977–1978.** His own practice with the system from June 1977; the name
   "Frippertronics" from the Kitchen, Soho, **5 February 1978** — both per Tamm, and
   per correction C-01 *not* May 1977 as brief v1 had it.
8. **Schellinx lands it.** Naming an originator makes no sense — this arrived with the
   machine. Two tape recorders and a cable have this behaviour in them; wherever the
   machines were, somebody found it. Attributed to Schellinx, stated as his.
9. **Exit to chapter 3.** What Riley's name says the machine does — accumulate against
   a time lag — is chapter 3's whole subject.

## Interactive

| | |
|---|---|
| Size | **S** — horizontal timeline, each node expandable |
| Component | `<Lineage>` (name provisional) |
| Preset | n/a — the timeline is the content; a node expands to one sentence, one date, one citation |
| What it teaches | the same machine topology arriving in different hands across twenty-five years; there is no priority dispute to have |
| What it must not imply | a transmission chain the sources do not draw — the arrow means *before*, not *because*; completeness; that the Kitchen date is settled beyond Tamm |

The timeline makes no sound and needs none; the chapter's point is documentary.

## Sources

- **Tooley interview, 1979** (`tooley-1979`) — the Eno-demonstration quotation,
  verified verbatim in the bibliography. Carries entry 1.
- **Tamm 1990** (`tamm-1990`) — June 1977 for the start of Fripp's own practice;
  5 February 1978 for the naming at the Kitchen. **Sole authority for both** (C-01); a
  second source is wanted before launch.
- **Peters, "The Birth of Loop"** (`loopers-birth-of-loop`) — the looping-history
  essay; currently the only manifest entry covering the pre-Eno nodes, and it is
  tertiary.
- **Schellinx, *Signs & Symptoms* part 1** (`sigsym-1`) — background and the
  arrived-with-the-machine point. Never cited for mechanics (part 2's job, in
  chapter 1).
- **LaFosse, Loopers Delight — Frippertronics** (`loopers-frippertronics`) — supports
  the lineage framing; live at the corrected URL (C-03).
- **Wikipedia — *Discreet Music*** (`wikipedia-discreet-music`) — orientation for the
  Eno node only; printed facts still need a primary.

**Gaps, explicit:** the manifest has **no entries** for the Schaeffer/Poullin
morphophone, Conrad 1961, Riley 1963 (the Time Lag Accumulator), Oliveros 1966, or the
"Fripp/Walton 1977" item the page spec lists — the last needs *identifying* before it
can be sourced. Until per-node entries land, those nodes cannot print dates
(Content methodology §4: every factual claim one click from `/sources`).

## Claims requiring the editorial mark

None. Everything here is sourced fact, quotation, or attributed analysis —
Schellinx's point is his, attributed, not ours. ADR-005 makes *accuracy* the gate;
there is no framing of ours to mark, and none may be smuggled in.

## Claims that stay hedged

- **5 February 1978** and **June 1977** — Tamm is sole authority; attributed to him,
  never stated flatly, until a second source lands (C-01, bibliography §10).
- Every pre-Eno date, until per-node sources are in the manifest.
- Any causal arrow between nodes — who learned from whom is asserted nowhere the
  sources do not state it; Eno's route to the system is not narrated beyond what
  Tooley carries.

## Rights notes

- No reproduced imagery on the timeline — no sleeves, no photographs; text nodes with
  citations. Deep-link rather than reproduce (Content methodology §4).
- The Eno-demonstration sentence (~20 words) is the chapter's only quotation, well
  within budget; no aphorism used (ADR-030 count unchanged).
- No hosted audio (ADR-032); nodes that mention records link out legally in Part V's
  style, or not at all.

## Acceptance criteria

- [ ] **The chain is correct and non-hagiographic** — the credibility gate (ADR-005);
      it must read correctly to a reader who already knows this history.
- [ ] Fripp's non-claim appears in his own words *before* any lineage node.
- [ ] Every printed date resolves to `/sources` in one click; a node without a
      manifest entry prints no date — **currently blocks the Schaeffer/Poullin,
      Conrad, Riley, Oliveros and Fripp/Walton nodes**.
- [ ] The Kitchen date prints **5 February 1978**, attributed to Tamm, never May 1977
      (C-01).
- [ ] The Time Lag Accumulator is named here and cross-linked from chapter 3.
- [ ] Schellinx's point lands as his — attributed, not an unattributed moral.
- [ ] The chapter makes its point with audio disabled (it contains none).
