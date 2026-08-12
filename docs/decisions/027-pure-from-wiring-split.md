---
title: "Engines are split pure-from-wiring"
number: 27
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-027: Engines are split pure-from-wiring

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-027, 2026-08-11).

## Context and Decision

`Tape.curves` and `Cycles.math` contain only pure functions of numbers and touch no
`AudioContext`. That half is trivially covered. The node-graph half is covered against a
mock. Real DSP behaviour is verified separately in a browser. This seam is the reason
100% is achievable rather than aspirational.
**Reversal cost:** high — it is the testing strategy.
