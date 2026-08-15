---
title: "One voice at a time: the audio lifecycle arbiter"
number: 47
status: accepted
date: 2026-08-14
related: ["015", "029", "035", "037"]
---

# ADR-047: One voice at a time — the audio lifecycle arbiter

## Context

The launch shipped instruments that boot a quiver worklet each and never tear it
down. `QuiverAudioNode.dispose()` had zero call sites; unmount cleanups cancelled
animation frames only. Measured consequence (audit, 14 Aug 2026): one tapped note
on chapter 3's mud instrument still sounded on the next page at peak 58/128 two
seconds after navigation, decaying into a permanent hiss bed — because tape hiss
was injected *inside* the recirculating loop, a booted rig could never reach
silence again. Five worklets could sound at once on the grammar page; three
unsynced Cycles transports on Part I; Swells and NotCommitting had no control
that could silence a tail at all. The client's report — audio "doesn't stop
playing when you would expect or start playing when you would expect" — is this
architecture, experienced.

## Decision

**One page-load, one arbiter, one voice sounding at a time.**

1. **The arbiter** (`src/audio/arbiter.ts`, pure) owns which instrument holds
   the voice. Starting any instrument claims the voice; the previous holder is
   silenced first — a fast fade, then its tape is wiped. Subscribers (the sound
   bar, the spine) see every change.
2. **Unmount retires the voice.** Every instrument that boots an engine
   registers `{ silence, dispose }`; route changes and unmounts call both. No
   worklet outlives its component. Re-entering a page boots fresh.
3. **A master bus** (`src/audio/live.ts`) sits between every engine and
   `destination`. The site-wide sound bar drives it: master volume, and a kill
   switch that silences the holder, wipes its tape, and suspends the context.
   The context also suspends when the kill switch fires and resumes inside the
   next start gesture — `resume()` is the arbiter's job now, not a comment's.
4. **Hiss leaves the loop.** `hissLevel.out` feeds `loopOut.in`, not `tape.in`:
   tape character without recirculating accumulation. Silence is reachable;
   `runaway` no longer self-ignites from noise with no input. (The old wiring's
   per-pass hiss build-up was honest to tape but hostile to a web page that must
   be able to stop sounding.)
5. **Every sounding instrument shows a stop.** Instruments with latching or
   long-tail behaviour carry a visible "Stop the tape" that triggers their own
   silence; the sound bar's kill switch is the site-wide guarantee.

## Consequences

- "Switching between examples" becomes a musical act: the incoming instrument
  fades the outgoing one, on the same page or across pages.
- The contract suite (tier 3) re-baselines: hiss no longer accumulates, so
  steady-state noise assertions change; decay-vs-oracle assertions do not.
- A new e2e spec drives the lifecycle the way the audit did — boot, navigate,
  assert measured silence; start B, assert A stopped — and is part of the gate.
- Tails within a page survive only while the instrument holds the voice; a
  lesson that wants its tail to be interrupted by the next embed gets that for
  free. The Rig's accumulation lessons are unaffected — it is alone on its page.
