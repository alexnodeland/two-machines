---
title: "jsdom cannot test Web Audio; three-tier strategy instead"
number: 28
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-028: jsdom cannot test Web Audio; three-tier strategy instead

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-028, 2026-08-11).

## Context and Decision

jsdom does not implement Web Audio. Tier 1 pure math in node. Tier 2 graph construction
against a mock context. Tier 3 actual audio behaviour in a real browser via
`OfflineAudioContext` under Playwright. Coverage thresholds apply to tiers 1–2.
**Reversal cost:** medium.
