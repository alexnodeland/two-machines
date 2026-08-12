---
title: "Bun is the package manager and script runner; Node is the runtime"
number: 25
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-025: Bun is the package manager and script runner; Node is the runtime

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-025, 2026-08-11).

## Context and Decision

`bun install`, `bun run`. Gatsby itself still executes on Node. This is not a full Bun
stack and the docs should not imply it is.
**Reversal cost:** low.
**Known sharp edge:** Bun skips dependency lifecycle scripts by default;
`gatsby-plugin-sharp` and friends need `trustedDependencies`. See [Tech stack](../architecture/tech-stack.md).
