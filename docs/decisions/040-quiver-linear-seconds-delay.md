---
title: "quiver gap 3 — a linear-seconds delay-time input"
number: 40
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-040: quiver gap 3 — a linear-seconds delay-time input

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-040, 2026-08-11).

## Context and Decision

`DelayLine` maps its time CV exponentially (`1 ms · 2000^cv`). The site's hero gesture
is linear in **centimetres of bench**, so we would be inverting an exponential and
spending most of the control range outside the 3–5 s window where the whole subject
lives. Proposed: an alternative time input taking seconds directly, leaving the
exponential CV path untouched for chorus/flanger use.
**Owner:** joint, upstream in quiver.
**Note:** quiver's existing 5 ms `smoothed_delay` slew already produces the pitch glide
[D-014](014-ramped-delay-pitch-glide.md) asks for. That
behaviour must survive this change — it is a feature here, not a workaround.
