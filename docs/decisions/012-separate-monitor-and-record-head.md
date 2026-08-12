---
title: "Monitor and record head are separate nodes from the first commit"
number: 12
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-012: Monitor and record head are separate nodes from the first commit

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-012, 2026-08-11).

## Context and Decision

Fripp's two volume pedals. `monitor` (dry to room) and `recordHead` (into the delay
line) are independent gains, so "solo without committing anything" is a capability
rather than a diagram. v2 §1.3 argues this is the most important technical detail on
the site.
**Reversal cost:** high — retrofitting a split into a single-tap graph touches every
preset.
