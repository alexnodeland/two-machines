---
title: "Pixels map to centimetres at a constant scale"
number: 11
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-011: Pixels map to centimetres at a constant scale

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-011, 2026-08-11).

## Context and Decision

Consequence: a floor of roughly 1.5 s at full desktop width, because two touching decks
still have about a deck's width of tape between their head assemblies. Accepted, and
physically honest. The alternative — a scale that stretches as you drag — makes the
ruler a lie.
**Reversal cost:** low.
**Departs from brief:** v1 §2.2 specifies a 0.5–8 s range. Sub-1.5 s delays are reached
via the M-size instruments, which use a seconds fader and no bench.
