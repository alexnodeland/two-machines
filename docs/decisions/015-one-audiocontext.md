---
title: "One `AudioContext` for the entire site"
number: 15
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-015: One `AudioContext` for the entire site

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-015, 2026-08-11).

## Context and Decision

Created lazily on first user gesture, shared by both engines. Both engine modules
import the same accessor. Never more than one, ever.
**Reversal cost:** medium.
