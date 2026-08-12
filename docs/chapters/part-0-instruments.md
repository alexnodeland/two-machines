---
title: "Part 0 · The Instruments"
page: /
last_updated: 2026-08-11
related_adrs: ["010", "011", "012", "015", "032", "042"]
---

# Part 0 · The Instruments

## One idea

The technique is a feedback system, and this page is one: the site opens with the
machine running, and what the reader does to it comes back at them a few seconds later.

## What the reader can do afterwards

Operate the Rig — drag the machines apart and hear the delay lengthen — and see the
shape of the whole site in one screen, without having read more than a paragraph.

## Outline

Prose budget: **one paragraph of orientation, no more** (page spec). The page is not a
chapter; it is a bench with a map underneath.

1. **The Rig, above everything.** Running before the reader has read anything — the
   reels turn, the readouts live, the bench is draggable — but **silently**: no sound
   until an explicit user gesture ([Accessibility](../architecture/accessibility-and-interaction.md);
   the `AudioContext` is created lazily on that first gesture). Visual motion carries
   the invitation; audio is consent-gated, which is both the WCAG posture and browser
   autoplay policy.
2. **One paragraph.** What this site is: a machine and a discipline, and one idea
   connecting them. Names the two halves and points down. No history, no biography,
   no vocabulary the Rig has not already made concrete.
3. **Below the fold: the table of contents.** One screen. The two halves legible as
   halves — The Machine (ch. 1–6) and The Discipline (ch. 7–10) — with Part I, The
   Room, Listen, Sources and the Cycles engine placed so the reading order
   ([IA §1](../architecture/information-architecture.md#reading-order-vs-file-order))
   is visible without being enforced.
4. **The non-affiliation line**, footer position, per
   [Rights and legal §5](../architecture/rights-and-legal.md#5-the-non-affiliation-statement).

## Interactive

| | |
|---|---|
| Size | **L** — the Rig, full bench |
| Component | `<Rig>` |
| Preset | `default` (distance 4.2 s · feedback 0.75 · record 0.85 · monitor 0.85 · age 0.35 — [Audio engine §9](../architecture/audio-engine.md#9-presets)) |
| What it teaches | delay time **is** machine distance (ADR-010, ADR-011); the loop decays because playback level is below unity; sound requires a gesture |
| What it must not imply | that anything is a recording of Fripp — all sound is synthesised in the browser (ADR-032); that audio will start uninvited |

Mobile: the bench scrolls rather than shrinking (ADR-042). Deep links from every
grammar lesson land back on this same engine with presets as URL state.

## Sources

- **v1 §2.2** (the client brief) — the "page as feedback system" framing and the
  running-on-arrival requirement. Origin of the design, not a citation on the page;
  the page itself cites nothing.

## Claims requiring the editorial mark

None. The single paragraph is orientation, not argument; it makes no claim about
Fripp's music that would need the mark. If a sentence drifts toward the thesis during
drafting, it moves to Part I.

## Claims that stay hedged

None — the page asserts nothing hedgeable.

## Rights notes

- The non-affiliation statement appears here in full (footer), as on every page.
- No hosted audio (ADR-032): the Rig synthesises; nothing is a recording.
- No photographs of Fripp or his equipment — the bench is a diagram in the site's own
  visual language.
- Quotation and aphorism budgets untouched by this page.

## Acceptance criteria

- [ ] A first-time visitor drags the machines apart and hears the delay change within
      15 seconds, without reading anything (the page-spec acceptance).
- [ ] No sound of any kind before an explicit user gesture; the bench still visibly
      runs before it.
- [ ] Prose is exactly one paragraph.
- [ ] The table of contents fits one screen and the two halves read as halves.
- [ ] The non-affiliation line is present and verbatim per rights-and-legal §5.
- [ ] The page works — bench visible, ToC usable — with audio never enabled.
