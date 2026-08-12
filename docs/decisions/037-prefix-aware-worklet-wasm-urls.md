---
title: "Worklet and wasm URLs must be prefix-aware"
number: 37
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-037: Worklet and wasm URLs must be prefix-aware

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-037, 2026-08-11).

## Context and Decision

`createQuiverAudioNode` takes `workletUrl` and `wasmUrl`. Under
[D-029](029-github-pages-pathprefix.md) both
must be resolved through Gatsby's `withPrefix`. A raw `/quiver.worklet.js` loads in
`gatsby develop` and 404s in production — and because audio is initialised on a user
gesture rather than at page load, **the failure is invisible until someone presses
play**. Smoke test in CI must assert both assets resolve at the deployed prefix.
**Reversal cost:** low to fix, high to diagnose.
