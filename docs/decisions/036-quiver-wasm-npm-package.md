---
title: "`@quiver-dsp/wasm` is published to npm with prebuilt WebAssembly"
number: 36
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-036: `@quiver-dsp/wasm` is published to npm with prebuilt WebAssembly

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-036, 2026-08-11).

## Context and Decision

The site's CI installs a versioned package and never needs a Rust toolchain. Forces
quiver's public API to stabilise enough to carry a version number, which is worth doing
anyway. The alternative — a git dependency plus `wasm-pack` in the deploy workflow —
couples every site deploy to quiver's `main` and roughly doubles build time.
**Reversal cost:** medium.
**Requires of quiver:** an npm release pipeline and semver discipline on a pre-1.0
library. This is a real cost and it lands on the quiver side, not the site side.
