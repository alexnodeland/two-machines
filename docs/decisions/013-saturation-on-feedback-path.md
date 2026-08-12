---
title: "Saturation sits on the feedback path"
number: 13
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-013: Saturation sits on the feedback path

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-013, 2026-08-11).

## Context and Decision

A `tanh` waveshaper before the feedback gain. Without it, feedback at or past unity
clips digitally instead of turning to mud, and the near-unity lesson is unplayable.
Tape compresses; a bare gain node does not.
**Reversal cost:** low technically, high pedagogically.
**Validated:** yes.
