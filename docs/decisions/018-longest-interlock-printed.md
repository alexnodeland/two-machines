---
title: "`longestInterlock` is the number we print"
number: 18
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-018: `longestInterlock` is the number we print

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-018, 2026-08-11).

## Context and Decision

`longestGap` is the interval between coincidences (18 for five-against-seven);
`longestInterlock` is the count of beats between them, on which nothing agrees (17).
The second is musically meaningful and matches the existing five-against-seven page.
Both are exported; the UI prints the second.
**Reversal cost:** low, but silently swapping them makes two pages disagree.
