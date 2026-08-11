# 11 · Rights and legal

Take this seriously. DGM is an unusually vigilant rights holder, and the aphorism terms
are written down in Fripp's own hand.

This document says what we may not build, not merely what we should be careful about.

---

## 1. Posture

**Unaffiliated, non-commercial, sparing, attributed.**

The site states its non-affiliation plainly, carries a real contact address, and makes no
money. That posture is not only ethical cover — it is what keeps us inside Fripp's own
stated terms for the aphorisms, and it is why the "book" question mattered until it was
resolved ([D-002](00-decision-log.md#d-002--this-is-a-website-there-is-no-book--firm)).

---

## 2. The five hard rules

### R-1 · No hosted audio. None.

Not clips, not "fair use" excerpts, not thirty seconds. Every listening reference links
out to DGM Live, Bandcamp or a streaming service.

The site's own sound is **synthesised in the browser** and is not a recording of
anything. This is worth stating on `/colophon`, because a visitor hearing tape delay
might reasonably assume otherwise.

### R-2 · No aphorism collection, index, or widget.

Three or four quoted in context where they do real work, each attributed and linked to
`partitasmusic.com/aphorisms` and `guitarcraft.com`. **Hard cap: four across the entire
site.**

Fripp's 2001 Sassoferrato course diary grants permission to quote an aphorism or several
publicly, on websites, with acknowledgement — and **explicitly forbids use *in toto or in
bulk*, and forbids commercial use entirely.**

Therefore forbidden, unambiguously:
- an aphorism database or searchable index
- an "aphorism of the day" widget
- a page listing them
- any aphorism behind or beside anything monetised

**This is the single most likely way to get a takedown.** Read the terms before quoting.

### R-3 · No King Crimson transcriptions or tab.

The *Discipline* parts are copyrighted compositions; published transcriptions are
derivative works. Describe the meters, model the rhythm, name the device — never print
the notes.

Concretely, for the Cycles engine
([D-017](00-decision-log.md#d-017--the-cycles-engine-models-meters-never-parts--firm)):
- presets carry **a cycle length and a downbeat**, nothing more
- timbres are **generic strikes**, distinguished by register alone
- any richer pattern is **built by the user**
- the guarantee is **printed on the page**

A cycle length and a downbeat are public analytical fact — the sort of thing a review
prints. A pattern of hits is a composition.

### R-4 · Non-commercial.

No ads, no affiliate links on the gear pages, no merch, no sponsorship, no "buy me a
coffee". The aphorism terms alone rule out commercial use, and the goodwill is worth
more than the affiliate revenue.

The gear chapter names specific pedals. **It must not link to a shop.**

### R-5 · Quote sparingly, paraphrase mostly, attribute always.

Deep-link rather than reproduce. See the quotation budget in
[10 §4](10-content-methodology.md#quotation-budget).

---

## 3. Third-party material

| Material | Position |
|---|---|
| **Eric Tamm's book** | Made freely available online by its author, and mirrored on the Internet Archive as opensource. **Short quotations with attribution only.** Do not commit the full text to the repository or mirror it on the site. |
| **Gurdjieff's texts** | Copyright varies by edition and jurisdiction. **Cite Robertson's summaries in preference** ([D-034](00-decision-log.md#d-034--cite-robertson-rather-than-gurdjieff-directly--firm)). |
| **Robertson (2017)** | Peer-reviewed and open access. Cite and link; do not rehost the PDF. |
| **Eno's *Discreet Music* diagram** | The liner drawing is Eno's. We draw an **honest descendant** in our own visual language and say what it descends from. We do not reproduce the original. |
| **Guitar Craft Monograph No. 3** | Out of print. Locate an image for **reference only**. Not reproduced, and its aphorisms count against the R-2 cap. |
| **Bruford and the Beat** | Cite and link the YouTube copy; do not embed, rehost or transcribe wholesale. |
| **Photographs of Fripp or the rig** | **None**, unless explicitly licensed. Diagrams instead — which is the better design decision anyway ([05 §1](05-design-system.md#1-direction)). |

---

## 4. Licensing

[Client decision, 11 Aug 2026.] **Split licence:**

| | Licence | Covers |
|---|---|---|
| **Code** | **MIT** | Engines, components, build. Matches quiver's MIT and honours v1 §2.6's intent that the simulator be reusable. |
| **Prose, research, diagrams** | **CC BY-NC-SA 4.0** | Chapters, bibliography, SVGs. |

The non-commercial term encodes [R-4](#r-4--non-commercial) into the licence itself
rather than leaving it as a stated intention, and keeps the prose consistent with the
aphorism terms it quotes under.

Stated on `/colophon` and in `LICENSE` / `LICENSE-CONTENT` at the repo root. Quoted
material remains the property of its rights holders and is **not** relicensed by either —
worth saying explicitly, because CC BY-NC-SA on a page containing a Fripp quotation
should not be read as licensing the quotation.

---

## 5. The non-affiliation statement

On `/colophon`, and in the footer of every page:

> Unaffiliated with Robert Fripp, Discipline Global Mobile, Panegyric or Guitar Craft.
> "Frippertronics" is Robert Fripp's coined term, used here descriptively. No audio is
> hosted; every listening reference links out. All sound on this site is synthesised in
> your browser.

Plus a real, monitored contact address.

---

## 6. If a complaint arrives

Decided in advance, calmly, rather than improvised:

1. **Respond quickly and courteously.** This is a non-commercial tribute-adjacent
   reference site; there is no upside in being difficult.
2. **Comply first on anything aphorism- or composition-related**, then discuss. These are
   the areas where the rights holder's position is strongest and clearly stated.
3. **Do not quietly delete the record.** If material is removed, `/colophon` says what was
   removed and why. Silent deletion looks worse than compliance.
4. Keep this document's decision log entries and the reference file as the evidence that
   the constraints were designed in rather than bolted on.

---

## 7. Optional: approaching DGM

Now that the site is non-commercial and there is no book, **a permission letter is not
legally necessary** — a non-commercial website quoting a handful of attributed aphorisms
sits inside Fripp's stated terms.

It may still be worth doing as courtesy, and would open the door on two things we
currently cannot have: the *Discreet Music* diagram lineage, and any use of imagery.
Filed as optional in [14 · Open questions](14-open-questions.md), not as a blocker.

---

## 8. Compliance checklist

Run before launch, and again on any content change:

- [ ] Zero audio files served from our origin
- [ ] Aphorism count ≤ 4, each attributed and linked
- [ ] No aphorism list, index, search or widget
- [ ] No tab, notation, or transcription anywhere
- [ ] Cycles presets carry cycle length and downbeat only
- [ ] Meters-only guarantee printed on the Cycles page
- [ ] No ads, affiliates, shop links, or donation prompts
- [ ] Non-affiliation statement in the footer of every page
- [ ] Contact address live and monitored
- [ ] Both licences present and correct; quoted material excluded
- [ ] No photographs of Fripp or his equipment
- [ ] Tamm's full text absent from the repository
