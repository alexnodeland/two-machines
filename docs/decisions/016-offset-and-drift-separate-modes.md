---
title: "Offset and drift are separate modes, and the grid is disabled in drift"
number: 16
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-016: Offset and drift are separate modes, and the grid is disabled in drift

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-016, 2026-08-11).

## Context and Decision

Fixed integer offset (finite orbit, exact return at the LCM) and continuous drift (no
return, ever) are different mathematical objects. The LCM grid is *disabled* in drift
because there is nothing to come home to. v2 §1.1 argues most looping literature
conflates them; refusing to blur it in the UI is the site's clearest contribution.
**Reversal cost:** high — it is the thesis, expressed as an interaction.
**Validated:** yes.
