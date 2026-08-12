---
title: "Chapter 1 · What it is"
page: /machine/what-it-is
last_updated: 2026-08-11
related_adrs: ["003", "004", "010", "011", "046"]
---

# Chapter 1 · What it is

## One idea

One reel of tape crosses from the left deck to the right; the right one's output is
wired back into the left.

## What the reader can do afterwards

Trace the signal path from string to repeat: say where the delay time comes from
(machine distance over tape speed), where the decay comes from (a level, not a count),
and why the system is not strictly a loop even though it behaves as one.

## Outline

Short and factual — the site's least editorial page. The mechanism must land in **four
sentences** (page-spec acceptance); entries 1–4 below are those four sentences, one
each. Everything after them is naming and context.

1. **Two decks, one reel.** Tape leaves the left machine's supply reel, crosses the
   gap, and takes up on the right; the left machine records, the right plays back.
2. **The wire back.** The right machine's playback output is cabled into the left
   machine's record input — the cable, not the tape, is what repeats.
3. **The caveat, stated exactly.** It is not strictly a loop: the tape runs machine to
   machine and never returns; it behaves as a loop only because the *signal* is fed
   back. Fripp's own caveat, carried early and load-bearing.
4. **Where the delay time comes from.** The distance between the machines divided by
   the tape speed (7½ ips) — delay time *is* a distance (ADR-010, ADR-011); the XS
   readout prints the live value beside this sentence.
5. **Where the decay comes from.** The playback level feeding the record input;
   feedback is a level, not a number of repeats. One sentence only — chapter 3 owns
   every consequence.
6. **What it is called.** The interstice definition, quoted in full, naming the
   components — guitar, Frippelboard, two Revoxes. "Frippertronics" capitalised, used
   descriptively, never as the brand (ADR-004); the naming *story* belongs to
   chapter 2.
7. **The diagram.** One schematic carries entries 1–3 — a descendant of Eno's
   *Discreet Music* sleeve drawing, in our own visual language, record path brass and
   playback path aqua. **Blocked on Q-02** — see Rights notes.

## Interactive

| | |
|---|---|
| Size | **XS** — inline live delay-time readout, reflecting the Rig's current state |
| Component | `<DelayReadout>` (name provisional) |
| Preset | none — it is read-only; it reflects the Rig, it does not set it |
| What it teaches | delay time is a distance at a speed, and the number printed is the same number the Rig on `/` is using right now |
| What it must not imply | that it is a control; that the system is a tape loop; anything audio — it makes no sound of its own |

This is the only XS on the site, and Q-11 keeps it on probation: build the inline
readout here, and if it reads as decoration, drop it *and the rung*. The readout prints
seconds to two decimals, tabular (Content methodology §5).

## Sources

- **Ron Gaskin interview, 1979** (`gaskin-1979`) — the clearest mechanical description
  Fripp ever gave of the two-machine signal path, and the intended carrier of the
  caveat. **Blocker: full text not located** — known only via secondary quotation
  (Plan-001 source table; manifest status `manual`). Until it surfaces, the mechanics
  cite Schellinx and the caveat is attributed at second hand.
- **Eno, *Discreet Music* liner notes and schematic, 1975**
  (`eno-discreet-music-sleeve`) — the ancestor of the hero diagram. **Blocker: Q-02** —
  the physical sleeve or a good scan is needed before the diagram can be drawn.
- **Fripp's definition, 1980, quoted in Tamm** (`tamm-1990`) — the interstice
  definition, verified verbatim in the bibliography; the fuller version that names the
  components is the one used.
- **Schellinx, *Signs & Symptoms* part 2** (`sigsym-2`) — verified first-hand
  operational account; carries the mechanics (simultaneous pause release, monitoring
  through machine one's line out, feedback ridden on the input dials) while Gaskin is
  missing. Part 1 is never cited for mechanics.

## Claims requiring the editorial mark

None. The chapter asserts mechanism and quotation only — no framing of ours appears,
so no mark appears. A mark on settled fact would dilute the marks that matter
(ADR-003).

## Claims that stay hedged

- The caveat's exact wording. Until the Gaskin text is located it is paraphrased and
  attributed at second hand, never presented as verbatim Fripp.
- Nothing else — this is deliberately the most factual page on the site.

## Rights notes

- **The hero diagram is blocked (Q-02).** It must be drawn from the real sleeve, not
  reconstructed from memory; no placeholder drawn from memory ships, even temporarily.
  What ships is an honest descendant in our own visual language, credited to the
  sleeve — never a reproduction (manifest note on `eno-discreet-music-sleeve`).
- The interstice definition is one of the two permitted over-budget quotations
  (Content methodology §4). It is spent *here*; chapter 5 refers back rather than
  re-quoting.
- If the Gaskin text is found, quotation from it falls under the ordinary ~50-word
  budget — the exception list does not grow.
- No aphorism used (ADR-030 count unchanged); no hosted audio (ADR-032).

## Acceptance criteria

- [ ] The mechanism is explained in **four sentences and one diagram** (the page-spec
      acceptance; outline entries 1–4 are the sentences).
- [ ] The caveat is present and load-bearing: a reader can say why it is not strictly
      a loop — the tape does not return; the signal is fed back.
- [ ] The diagram is drawn from the real sleeve — **blocked on Q-02**; the chapter
      cannot ship its hero until the sleeve is seen.
- [ ] The diagram has a text alternative that conveys the relationship, not a
      description of the picture (Content methodology §6).
- [ ] The XS readout agrees with the Rig's state to two decimals — or is dropped along
      with the rung (Q-11), and the chapter still stands.
- [ ] No editorial mark appears; every factual claim resolves to `/sources` in one
      click.
- [ ] The chapter makes its point with audio disabled (the readout and diagram carry
      it).
