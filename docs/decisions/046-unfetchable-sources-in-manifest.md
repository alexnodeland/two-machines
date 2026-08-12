---
title: "Unfetchable sources stay in the manifest"
number: 46
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-046: Unfetchable sources stay in the manifest

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-046, 2026-08-11).

## Context and Decision

A source we cannot currently archive keeps its entry, with `fetch.status` and a
`fetch.hint` saying what would make it work. Dropping it would lose the fact that we need
it, and would let the archive look complete when it is not.

Consequence: the manifest is a **known target list** for improving the fetcher, not just
an inventory of what we happened to get. Currently 5 `blocked` (live, but refusing
automated fetch — likely fixed by a Playwright-backed mode) and 6 `manual` (a book, a
video, a record sleeve — need a human).

The fetcher also **rejects a 200 that is really a bot-check page**, so a challenge page
can never masquerade as an archived source. This already caught one.
**Reversal cost:** low.
