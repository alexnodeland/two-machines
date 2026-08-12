---
title: "Delay time is ramped, and the pitch glide is kept"
number: 14
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-014: Delay time is ramped, and the pitch glide is kept

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-014, 2026-08-11).

## Context and Decision

`setTargetAtTime`, not `.value =`. Dragging a deck glides in pitch exactly as sliding a
real machine along a bench does. The artifact is the honest behaviour.
**Reversal cost:** low.
**Departs from brief:** v1 §2.5 cites the Pd anti-click ramp as a technique to avoid
artefacts; we keep the artefact deliberately in the Rig, and mention the ramp in the
build chapter as the technique for when you *don't* want it.
