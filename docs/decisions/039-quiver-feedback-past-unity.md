---
title: "quiver gap 2 — opt-in feedback past unity"
number: 39
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-039: quiver gap 2 — opt-in feedback past unity

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-039, 2026-08-11).

## Context and Decision

`DelayLine` clamps feedback to `0.99` with the comment *"Prevent runaway"*. On this
site **runaway is a lesson** — v1 §2.2 says to mark the unity line and let it go past.
Proposed: an opt-in unclamped mode allowing feedback ≥ 1.0, with saturation in the loop
so the result is mud rather than a detonation. Defensible in a modular library on its
own terms: hardware self-oscillates, and refusing to is the unusual choice.
Existing NaN sanitisation already protects the buffer from latching, which makes this
materially safer to add than it would otherwise be.
**Owner:** joint, upstream in quiver.
**Safety:** the site pairs this with a hard output limiter — see [Audio engine](../architecture/audio-engine.md).
