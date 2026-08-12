---
title: "Vitest, with 100% thresholds and `all: true`"
number: 26
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-026: Vitest, with 100% thresholds and `all: true`

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-026, 2026-08-11).

## Context and Decision

`all: true` is non-negotiable: without it, 100% is reachable by simply not importing
your worst module. Thresholds enforced in CI from the first commit.
**Reversal cost:** low to configure, high to retrofit if allowed to lapse.
