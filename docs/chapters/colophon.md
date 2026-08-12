---
title: "Colophon"
page: /colophon
last_updated: 2026-08-11
related_adrs: ["002", "003", "030", "032", "033"]
---

# Colophon

## One idea

The page where the site accounts for itself: what it is, who made it, what it is not
affiliated with, what it licenses, and which of its claims are its own.

## What the reader can do afterwards

Know exactly who stands behind the site, how to contact them, what may be reused under
which licence, and how to tell the site's analysis from its sourced facts.

## Outline

1. **What this is.** A non-commercial reference site (ADR-002, ADR-033); a website and
   not a book, deliberately. Two or three sentences.
2. **Who made it**, and **a real, monitored contact address** — required by the rights
   posture ([Rights §1](../architecture/rights-and-legal.md#1-posture)), not a
   courtesy. The address is confirmed live before launch.
3. **The non-affiliation statement**, verbatim per
   [Rights §5](../architecture/rights-and-legal.md#5-the-non-affiliation-statement):
   > Unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar
   > Craft. "Frippertronics" is Robert Fripp's coined term, used here descriptively.
   > No audio is hosted; every listening reference links out. All sound on this site
   > is synthesised in your browser.
   Here in full and in the footer of every page. The synthesised-sound sentence
   matters: a visitor hearing tape delay might reasonably assume otherwise (R-1).
4. **Licences** ([Rights §4](../architecture/rights-and-legal.md#4-licensing)):
   **code MIT**; **prose, research and diagrams CC BY-NC-SA 4.0**. Stated with the
   explicit rider that **quoted material remains the property of its rights holders
   and is relicensed by neither** — CC BY-NC-SA on a page containing a Fripp
   quotation does not license the quotation.
5. **Which claims are the site's own** — the editorial-mark system explained **once,
   here** (ADR-003): sourced facts carry citations to `/sources`; quotations are
   attributed inline; the site's own analysis wears the visible mark — *"Our framing,
   not Fripp's"* — and never carries a citation, because a footnote would launder
   opinion into apparent fact. States where the aphorism budget stands: at most four
   across the site (ADR-030), each attributed and linked, quoted under Fripp's own
   published terms.
6. **Removals, if any.** If material is ever removed on a rights holder's request,
   this page says what was removed and why (Rights §6) — silent deletion looks worse
   than compliance.

## Interactive

None. The one page on the site that is only prose about the site.

## Sources

- The aphorism usage terms (partitasmusic.com/aphorisms) — linked where the aphorism
  policy is stated, since the policy quotes under those terms.
- Otherwise none: the colophon makes claims about the site, not about the world, and
  cites nothing else.

## Claims requiring the editorial mark

None — and the page must say why, since it is where the mark is explained: the
colophon describes the site's own policies, which are neither sourced facts nor
analysis of Fripp's music.

## Claims that stay hedged

None.

## Rights notes

- This page **is** the rights surface: non-affiliation statement, both licences, the
  quoted-material exclusion, the synthesised-audio disclosure, and the contact
  address all live here (compliance checklist, Rights §8).
- `LICENSE` (MIT) and `LICENSE-CONTENT` (CC BY-NC-SA 4.0) at the repo root must match
  what this page states.
- The aphorism-budget statement here is the site-wide ledger of ADR-030; Part IV's
  planning doc defers its count to this page.

## Acceptance criteria

- [ ] Non-affiliation statement present verbatim, here and in every page footer.
- [ ] Contact address is real and monitored at launch.
- [ ] Both licences stated; quoted-material exclusion stated explicitly.
- [ ] The editorial-mark system is explained here and nowhere else at this length.
- [ ] The aphorism count stated matches the shipped site and is ≤ 4.
- [ ] The synthesised-in-browser sentence is present.
- [ ] No ads, affiliates, shop links or donation prompts anywhere on the page
      (ADR-033).
