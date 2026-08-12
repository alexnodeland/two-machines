---
title: "Accessibility and interaction"
last_updated: 2026-08-11
related_adrs: ["011"]
---

# Accessibility and interaction

A site built on sound and motion has to work for people who cannot use either. These are
requirements, not aspirations, and several are launch blockers.

---

## 1. The floors

Non-negotiable. Every one is a launch blocker.

1. **No microphone required.** Built-in tone pads are the default instrument, not a
   fallback. Assume no guitar, assume laptop speakers, assume headphones later.
2. **No audio required to learn.** Every chapter makes its point in text and image.
   Audio deepens; it never carries.
3. **Nothing autoplays.** Every sound starts on an explicit user gesture.
4. **A visible global mute**, reachable from anywhere, always.
5. **Full keyboard operation** of every instrument.
6. **`prefers-reduced-motion` respected** throughout.

---

## 2. Audio consent

WCAG 1.4.2 permits autoplay under three seconds. We do not use that allowance.

- **Nothing plays until a user gesture.** This also satisfies browser autoplay policy,
  which requires a gesture to resume an `AudioContext` — the accessibility requirement
  and the platform requirement point the same way.
- The `AudioContext` is created lazily on that first gesture, not at page load.
- **Global mute** is persistent, keyboard reachable, and survives navigation.
- Every instrument shows its own transport state in text, not by colour alone.
- **Output is limited** ([Audio engine §6](audio-engine.md#6-three-gaps-in-quiver-and-how-they-are-closed)).
  A page that invites you to push feedback past unity must not be able to hurt anyone.
  The limiter is a safety device and is never presented as a creative control.

### The runaway preset needs a warning

`runaway` deliberately drives feedback above unity. It must warn before it plays, and
the limiter ceiling must be verified in tier 3 tests. This is the one place the site
could genuinely damage hearing or equipment if the DSP were wrong.

---

## 3. Motion

WCAG 2.3.3 requires that motion animation from interaction can be disabled.

Under `prefers-reduced-motion: reduce`:

- Reel rotation stops.
- Pulse and flash animations become instant state changes.
- The spine still changes brightness but without transition — the information survives,
  the animation does not.
- **Playheads still move.** A playhead is not decoration; it is the information. It moves
  at the speed of the music either way.
- Canvas rendering continues. It represents live state.

The rule: **remove motion that decorates, keep motion that informs.**

---

## 4. Canvas and the semantics problem

Three instruments render to canvas, which has no intrinsic semantics. This is the
weakest part of the current design and is honestly recorded as such.

Mitigations, in order of preference:

1. **All controls are real DOM.** Faders are `<input type="range">`, pads are
   `<button>`, steppers are buttons. Nothing important is canvas-only.
2. **An `aria-live="polite"` textual summary** accompanies every canvas, updating on
   meaningful state change rather than per frame. For the Cycles engine: *"Offset mode.
   Cycles of 5, 7. Exact return after 35 pulses."*
3. **Every number on a canvas also appears in DOM text** — the stat grid, the readouts,
   the verdict.

### Resolved: rich generated descriptions, not SVG

The obvious fix is an SVG grid with real elements and `<title>`s. **We are not doing
that.** Element-by-element navigation of 210 cells is not comprehension — it is the same
data in a worse order, and it would cost a rewrite of working code.

**Instead: every canvas view generates a real description of the pattern**, in prose, as
its accessible alternative. Not a caption — a description that carries the same insight
the picture does.

For the Cycles grid on the *Discipline* preset:

> Fifteen columns, fourteen rows. Guitar one falls on the first column of every row, a
> straight line down the left edge. Guitar two starts in the first column and moves one
> column left each row, wrapping when it runs off the edge, so it leans across the grid
> as a diagonal. The two coincide only at the very start and again after 210 pulses.

That is better than tabbing through cells, and arguably better than the picture for a
reader who wants the mechanism stated.

Requirements:

- Generated from state, never hand-written per preset, or it will drift.
- Updated on meaningful change, not per frame.
- Present as the canvas's accessible description, and **also available to everyone** —
  a "describe this view" disclosure. Sighted readers benefit from the shape being named.
- Written to the same standard as the prose, per
  [Content methodology](content-methodology.md). This is content, not alt text.

**Residual gap, honestly:** a description is an interpretation. It tells you what we think
the shape means. A sighted reader can notice something we did not describe. That asymmetry
remains, and the disclosure being available to everyone is a partial mitigation, not a
cure.

---

## 5. Keyboard

| Context | Keys |
|---|---|
| Global | `M` mute · `?` shortcuts |
| Transport | `Space` play/stop |
| The bench | `Tab` to a deck; `←`/`→` move it; `Shift` for fine; `Home`/`End` extremes |
| Pads | Number keys on the Rig; `A S D F G H J K` on the M instruments |
| Faders | Native range behaviour, arrows and `Home`/`End` |

The bench decks are `role="slider"` with live `aria-valuenow` / `aria-valuetext`
reporting **both** seconds and centimetres — the readout is the lesson, so it must reach
a screen reader.

`aria-valuemin` and `aria-valuemax` are set from actual geometry, not hard-coded, because
the usable range depends on viewport width
([D-011](../decisions/011-constant-px-cm-scale.md)).

### A hazard worth designing against

Range inputs are everywhere on this site, and a stray scroll or focus change altering a
feedback level is a real risk — during prototype testing a tempo value changed under
automation without the page writing to it, and it was never fully attributed.

Requirement: **instrument state must be recoverable.** Every instrument has a visible
reset-to-preset control, and the current preset name is always displayed. If a value
drifts, the user can see that it has and get back.

---

## 6. Focus and structure

- Visible focus on everything, `2px` solid `--brass`, `3px` offset. Never removed.
- One `<h1>` per page; heading levels never skipped.
- Skip link to main content.
- Landmarks: `header`, `nav`, `main`, `footer`.
- Instruments are `<section>` with an `aria-label`.

---

## 7. Performance as an accessibility concern

- Canvas rendering pauses when off-screen (`IntersectionObserver`) and when the tab is
  hidden. Three instruments rendering at 60fps on a page nobody is looking at is a
  battery and heat problem.
- The WASM payload loads **on first audio gesture**, not at page load, so a reader who
  never presses play never downloads it.
- Static prose must be fully readable before any JavaScript executes. Gatsby gives this
  for free; do not break it by rendering chapter text from a client-only component.

---

## 8. Testing

| Check | Method | Gate |
|---|---|---|
| Automated a11y | `axe-core` in Playwright, every page | CI, blocking |
| Keyboard-only | Manual script per instrument | pre-launch, blocking |
| Screen reader | VoiceOver on the two L's and one of each smaller size | pre-launch, blocking |
| Contrast | Automated audit of token pairs | CI, blocking |
| Reduced motion | Playwright with the media feature emulated | CI, blocking |
| No-mic path | Every instrument, mic denied | CI, blocking |
| Limiter ceiling | Tier 3 offline render at feedback 1.18 | CI, blocking |
