---
title: "The Cycles engine models meters, never parts"
number: 17
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-017: The Cycles engine models meters, never parts

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-017, 2026-08-11).

## Context and Decision

Presets carry a cycle length and a downbeat. Timbres are generic strikes. Any pattern
beyond the downbeat is built by the user. Guarantee is printed on the engine page.
See [D-031](031-no-transcriptions-or-tab.md).
**Reversal cost:** n/a — legal constraint.
