---
title: "Lookahead scheduling, not `setInterval` alone"
number: 19
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-019: Lookahead scheduling, not `setInterval` alone

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-019, 2026-08-11).

## Context and Decision

A 25 ms timer books events 120 ms ahead on the audio clock; a queue feeds the paint
loop at the moment each event is heard. Per Chris Wilson's *A Tale of Two Clocks*.
`setInterval` alone is far too jittery to hear five against seven honestly.
**Reversal cost:** medium.
