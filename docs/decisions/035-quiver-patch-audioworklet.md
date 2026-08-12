---
title: "The rig is a quiver patch running in an AudioWorklet"
number: 35
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-035: The rig is a quiver patch running in an AudioWorklet

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-035, 2026-08-11).

## Context and Decision

Delay, filtering, saturation and analog drift all run inside one compiled quiver patch
on the audio thread. Quiver removed `createAudioContext`; `createQuiverAudioNode` is the
only supported browser path, so this is not a preference but the shape of the library.
The Web Audio graph shrinks to: source → `QuiverAudioNode` → destination.
**Reversal cost:** high — it is the audio architecture.
**Blocked on:** D-038, D-039, D-040.
**Supersedes:** the hand-built node graph in `mockups/engine.js`, which becomes a
reference implementation and a behavioural oracle (see [Testing strategy](../architecture/testing-strategy.md)),
not the shipping engine.
