---
title: "Canvas accessibility is solved by generated descriptions, not SVG"
number: 43
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-043: Canvas accessibility is solved by generated descriptions, not SVG

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-043, 2026-08-11).

## Context and Decision

Every canvas view generates a real prose description of the pattern from state, as its
accessible alternative and as a disclosure available to everyone. Rejected: an SVG grid
with per-cell elements — tabbing 210 cells is the same data in a worse order, not
comprehension.
**Honest residual:** a description is an interpretation, and a sighted reader can notice
what we did not describe. Offering the disclosure to everyone is a mitigation, not a cure.
**Reversal cost:** low.
