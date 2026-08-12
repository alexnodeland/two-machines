---
title: "The prototype engine becomes the behavioural oracle"
number: 41
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-041: The prototype engine becomes the behavioural oracle

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-041, 2026-08-11).

## Context and Decision

`mockups/engine.js` is not thrown away. Its measured behaviour — decay times at a given
feedback, the fact that a 0.9 s note is still audible 2.6 s later at 0.85 feedback — is
the reference the quiver patch is checked against. A rewrite that sounds different is a
regression until argued otherwise.
**Reversal cost:** low.
