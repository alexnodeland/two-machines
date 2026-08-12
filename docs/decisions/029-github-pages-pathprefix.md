---
title: "GitHub Pages project page, therefore `pathPrefix` IS required"
number: 29
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-029: GitHub Pages project page, therefore `pathPrefix` IS required

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-029, 2026-08-11).

## Context and Decision

Ships at `alexnodeland.github.io/two-machines`. That is a project page, not a custom
domain, so Gatsby needs `pathPrefix: "/two-machines"` in `gatsby-config.ts` **and**
`--prefix-paths` on the build command. Both, or asset URLs break.

Three consequences that bite specifically here:
- **No `CNAME` file.** Adding one without DNS breaks the deployment.
- **Every hand-written internal URL must go through Gatsby's `withPrefix`/`Link`.** A
  raw `<a href="/chapter-3">` works locally and 404s in production. This includes the
  **AudioWorklet and `.wasm` URLs** — see [D-037](037-prefix-aware-worklet-wasm-urls.md),
  which is the single most likely way this decision breaks the site silently.
- **Moving to a custom domain later means deleting the prefix**, not adding to it —
  Gatsby's docs are explicit that a `pathPrefix` on a custom domain breaks navigation.
  The prefix therefore lives in exactly one constant.

Restore only `.cache` in CI, never `public/`.
**Reversal cost:** low, but getting it wrong ships a green build and a broken site.

---


*Client decision, 11 Aug 2026: the DSP comes from `quiver`, the client's own Rust
audio-synthesis library, rather than from hand-built Web Audio nodes. The site remains
fully TypeScript; quiver arrives as compiled WebAssembly.*
