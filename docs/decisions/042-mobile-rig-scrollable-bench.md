---
title: "The mobile Rig is a scrollable bench at fixed scale"
number: 42
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-042: The mobile Rig is a scrollable bench at fixed scale

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-042, 2026-08-11).

## Context and Decision

Below ~600px the viewport becomes a window onto a bench longer than the screen. The
px↔cm scale does **not** change with viewport width, so the ruler stays true and the
teaching claim survives. Rejected: a seconds-fader fallback, which would give phone
readers the ordinary millisecond slider every other site has, on the most common device.
**Risk:** gesture conflict. `touch-action: pan-y` on the bench so vertical page scroll
always wins; deck drag moves a deck, background drag pans the view.
**Reversal cost:** low. **Execution unproven** — prototype at 375px before Phase 6.
