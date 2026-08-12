---
title: "quiver gap 1 — `DelayLine` needs a longer maximum"
number: 38
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-038: quiver gap 1 — `DelayLine` needs a longer maximum

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-038, 2026-08-11).

## Context and Decision

`MAX_DELAY_SECS` is a hard-coded `2.0`. The site needs 1.5–8 s of usable range, and
headroom above that. Proposed: make the maximum a construction parameter with the
buffer sized accordingly, defaulting to the current 2 s so no existing patch changes.
**Owner:** joint, upstream in quiver.
