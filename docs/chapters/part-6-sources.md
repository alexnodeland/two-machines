---
title: "Part VI · Sources"
page: /sources
last_updated: 2026-08-11
related_adrs: ["003", "045", "046"]
---

# Part VI · Sources

## One idea

The bibliography is the site's credibility made inspectable: every factual claim on the
site resolves here in one click, and the page never claims a link works that does not.

## What the reader can do afterwards

Follow any citation on the site to its source, see when that source was last verified,
and reach an archived copy when the live link has died.

## Outline

**Generated, not hand-written.** The single source of truth is the reference corpus:
[`references/sources.yaml`](../../references/sources.yaml) is the machine-readable
master, with [bibliography.md](../architecture/bibliography.md) as its prose companion
([Content methodology §4](../architecture/content-methodology.md#4-citation-discipline)).
Nothing is cited anywhere on the site that is not in that corpus; nothing appears on
this page that is not generated from it. Hand-maintained copies drift — this repo has
already deleted one set of hand-counted totals for exactly that reason.

1. **Grouping mirrors the bibliography**: Primary (Fripp's own words) · Scholarly ·
   History and mechanism · Method and modern practice · Rhythm, interlock and tuning ·
   Gurdjieff and Bennett · Rig and gear · Technical references.
2. **Each entry carries its last-verified date**, rendered from the manifest.
3. **Dead links point to a Wayback snapshot and say so** — visibly, not silently
   swapped. A 403-to-bots is recorded as such, not as dead (the Robertson lesson).
4. **Anchors** (`/sources#tamm-1990` style) are the citation targets the whole site's
   `†` footnotes resolve to; anchor IDs are stable and generated from the manifest.
5. A short head-note stating the archive policy: offline copies exist but are never
   committed or served (ADR-045); unfetchable sources stay in the manifest with what a
   human must do (ADR-046).

## Interactive

None. The page is a generated list. Its only behaviour is anchors and outbound links.

## Sources

All of them — this page *is* the sources. It cites nothing itself; it renders the
manifest. The corpus currently tracks 41 sources; live totals come from
`./fetch.sh --verify`, never from prose (counts drift — standing rule).

## Claims requiring the editorial mark

None. A generated bibliography makes no editorial claims. (Editorial claims elsewhere
on the site deliberately do **not** resolve here — a footnote would launder them,
ADR-003; the mark system is explained on `/colophon`, not on this page.)

## Claims that stay hedged

- Verification status is reported exactly as known: live / 403-to-bots / dead-with-
  snapshot / needs-a-human. The page never rounds "unverified" up to "live".

## Rights notes

- **Deep-link, never mirror** (R-5): entries link the Elephant Talk wiki, the
  substack, ORO — they never reproduce the documents. `references/files/` is
  gitignored and never served (ADR-045).
- Wayback links go to the Internet Archive's copy; we host no snapshots ourselves.
- No purchase-path entry links to a shop from this page (R-4); *The Guitar Circle* is
  cited as a book, not sold.

## Acceptance criteria

- [ ] The page is generated from the reference manifest; no hand-written entry exists
      in the page source, and a manifest edit changes the page without prose edits.
- [ ] Grouping matches the bibliography's sections one-for-one.
- [ ] Every entry shows a last-verified date.
- [ ] Every dead link shows a Wayback link and is labelled dead.
- [ ] Every citation anchor used anywhere on the site resolves to an entry here
      (checked in CI).
- [ ] The **weekly link check** over this page opens an issue on failure rather than
      failing a build ([CI/CD](../architecture/ci-cd.md)) — link rot is not a code
      defect.
- [ ] After editing the manifest, it still parses with a real YAML parser
      (`python3 -c "import yaml; yaml.safe_load(open('references/sources.yaml'))"`).
