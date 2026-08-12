---
title: "The reference archive is reproducible, not committed"
number: 45
status: accepted
author: Alex Nodeland
created: 2026-08-11
originating_proposal: null
superseded_by: null
---

# ADR-045: The reference archive is reproducible, not committed

## Status

Accepted · `firm` — reversing is expensive or invalidates work.

Imported from the planning-pass decision log (entry D-045, 2026-08-11).

## Context and Decision

`references/sources.yaml` (the directory) and `references/fetch.sh` (the fetcher) are
committed; `references/files/` is **gitignored**.

Local copies of sources are ordinary research practice and we want them — being able to
re-check a quotation months later is the difference between a bibliography and a list of
links. But most of this material is third-party and copyrighted, and a public repository
containing full texts is a **mirror, not a citation**. Tamm is the clearest case: freely
distributed by its author, and still not ours to republish.

Reproducibility replaces storage. `cd references && ./fetch.sh` rebuilds the archive.
**Reversal cost:** low, but reversing it means republishing copyrighted material, which
[Rights and legal](../architecture/rights-and-legal.md) forbids.
