---
title: "Chapter 6 · Building it"
page: /machine/building-it
last_updated: 2026-08-11
related_adrs: ["012", "035", "036", "041"]
---

# Chapter 6 · Building it

## One idea

The same four parameters — delay time, feedback, record level, monitor level — buy the
same music at four prices, and every tier is stated in numbers, not vibes.

## What the reader can do afterwards

Leave with a working rig at whichever tier they own: dial a pedalboard, patch a DAW,
run the site's own MIT engine, or honestly decide whether real tape is worth it — each
with the settings already translated.

## Outline

Four tiers, each an **anchor** (`#pedalboard`, `#daw-patch`, `#code`, `#tape`), each
opening with its settings card (see Interactive). Concrete numbers throughout; every
"about" is a range with endpoints.

1. **Pedalboard.** Minimum kit, Lamont verbatim: "any electric guitar, distortion FX,
   volume pedal, long, decaying delay". Settings: **4–8 s delay, feedback ~75%**.
   **Delay off with trails engaged is lifting the record head** — taught as an instance
   of the two-pedal split (ADR-012), the same lesson as grammar 3, not a new tip. Then
   the specifics: the RC-300 aux routing; the ping-pong doubling trick (two delays in
   series to double a pedal's maximum time); the Red Panda Tensor caveat — out of the
   box its overdub mode is a plain looper and needs a MIDI setting change.
2. **DAW / patch.** The three-track routing (send → delay return → feedback send). Max:
   delay tutorial 3's `Long_loop` — `tapin~`/`tapout~` plus a feedback gain, and the
   Max docs themselves frame it as the two-tape-machine technique. Pd:
   `delwrite~`/`vd~` with a `line~` ramp on the delay time to avoid clicks — the ramp
   is ADR-014's pitch glide by another name.
3. **Code.** A small implementation, MIT-licensed, that **is the site's engine**:
   quiver compiled to WebAssembly in an AudioWorklet (ADR-035, ADR-036). Not a toy
   beside the site — the Rig the reader has been playing all along, linked as source.
   The prototype `mockups/engine.js` remains the behavioural oracle (ADR-041): a 0.9 s
   note at 0.85 feedback still audible 2.6 s later is the number an implementation
   must hit.
4. **Tape.** The real thing, honestly costed: two working reel-to-reel decks
   (classically Revox A77s), one reel threaded machine to machine, delay time set by
   bench distance — at 7½ ips, 19.05 cm/s, a 4 s delay is 76 cm of bench. The
   operational reality from Signs & Symptoms part 2: the simultaneous release of both
   pause handles to start in sync; monitoring through the first machine's line or
   headphone output; feedback balanced at the input dials. Splicing, head cleaning,
   and the honest sentence: this tier costs the most and drifts the most, and that is
   partly the point.

## Interactive

| | |
|---|---|
| Size | **S per tier** — a settings card at the top of each anchor |
| Component | `<SettingsCard tier="pedalboard \| daw \| code \| tape">` |
| Content | the Rig's current parameters translated into that tier's vocabulary: 4.2 s / fb 0.75 → pedal time & repeats knob → `tapout~ 4200` & gain 0.75 → 80 cm of bench at 7½ ips |
| Live | reflects the actual Rig state, so changing the Rig upstairs changes every card |
| What it teaches | the four tiers are one machine — the translation *is* the lesson |
| What it must not imply | that the tiers sound identical (tape colours, code is clean); that authenticity requires buying anything — the reader is already holding tier 3 |

No audio of its own; the cards are pure derived readouts (Audio engine §3), fully
unit-testable. Numbers tabular; tape speeds as 3¾ / 7½ / 15 ips.

## Sources

- **Norman Lamont parts 1–2** (bibliography §4) — the minimum-kit list, verbatim, and
  the pedalboard settings' sanity check.
- **Signs & Symptoms, Harold Schellinx, part 2** (bibliography §3) — the field report
  for the tape tier: pause-handle release, monitoring, input-dial balancing, all
  verified verbatim. Part 1 is background only.
- **Max 7 delay tutorial 3 — `Long_loop`** (bibliography §4, *to re-check*) — the
  two-tape-machine framing in the vendor's own docs.
- **Red Panda Tensor Frippertronics mod** (bibliography §4, *to re-check*) — the MIDI
  caveat.
- **RC-300 aux routing, ping-pong doubling** — currently carried by the *to re-check*
  cluster in bibliography §4 (Line 6 blog, Mod Wiggler, Patchstorage); each claim must
  land on a verified entry before printing.
- **Quiver browser-integration guide** (bibliography §8) — the code tier.
- **Gap:** no Pd reference is in the bibliography; the `delwrite~`/`vd~`/`line~`
  passage needs an entry (the Pd docs) before it can carry a citation. Likewise the
  tape tier's *costs* have no source yet — current marketplace prices need an entry or
  the costing is dated prose, marked as of its writing date.

## Claims requiring the editorial mark

- "The four tiers are one machine" — the translation frame, and the settings cards
  that render it, are our teaching device. One page-level mark.
- "Drift is partly the point" in the tape tier — our judgement, marked, uncited.

Per ADR-003, neither carries a citation.

## Claims that stay hedged

- What Fripp's rig actually cost or costs now — never stated; only *today's* prices
  for *a* rig, dated.
- Whether the RC-300 routing and ping-pong doubling reproduce the split exactly or
  approximate it — stated as approximations until the re-check pass verifies the
  sources.

## Rights notes

- Lamont and Schellinx quoted within the ~50-word continuous budget, deep-linked, not
  mirrored.
- Max and Pd documentation is linked, never reproduced; no patch screenshots from
  vendor docs — our own diagrams only (content methodology §6).
- The engine's MIT licence applies to *our* code; quiver's own licence is stated
  beside it (rights doc owns the details).
- No hosted audio (ADR-032); no aphorism used — budget untouched.

## Acceptance criteria

- [ ] Every tier opens with a settings card showing the live Rig state in that tier's
      vocabulary, and the four cards agree with each other by construction.
- [ ] Every number has endpoints and units; no "long", "lush", or "roughly" without a
      range. Tape speeds render as 3¾ / 7½ / 15 ips.
- [ ] Delay-off-with-trails is taught as the record head, cross-linked to grammar 3,
      not as a standalone tip.
- [ ] The code tier links the actual engine source and states the oracle number.
- [ ] The tape tier's costing carries its as-of date; the Pd citation gap and the
      *to re-check* pedal sources are resolved before ship.
- [ ] The chapter makes its point with audio disabled — it is settings and wiring.
