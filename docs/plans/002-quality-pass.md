---
title: "The quality pass"
number: 2
status: active
author: Alex Nodeland
created: 2026-08-14
updated: 2026-08-14
originating_proposal: 1
related_adrs: ["003", "027", "029", "030", "032", "035", "037"]
---

# Plan-002: The quality pass

The launch gate measured correctness — types, coverage, axe, citations. It did not
measure the played experience. The client's verdict on the launched site (14 Aug
2026): audio doesn't stop or start when a player expects, switching between
examples doesn't work well, the instruments aren't explained or integrated, and
some prose still narrates the writing of the site instead of teaching the musician.
Standing mandate: make the whole thing dramatically better — the site *and* the
repo's public face (README, contributing, tooling).

This plan converts that verdict into phases. The audit that grounds it was run
14 Aug 2026: a code audit of every audio path, a browser reproduction against the
built site, a read of every chapter as a first-time guitarist, and a DX review of
the repo storefront. Findings are recorded per phase.

**New rule this plan adds to the gate: played-experience defects are release
blockers.** Before any instrument work is called done, it is driven in a real
browser: start sound, scroll away, switch example, navigate — audio state must be
predictable at every step.

---

## Phase A — The audio lifecycle (the bugs)

### Findings (audit, 14 Aug 2026)

Measured on the built site: tap one note on ch. 3's mud instrument, navigate away —
the next page still carries signal at peak 58/128 two seconds later, 15/128 ten
seconds later, decaying into a permanent hiss bed. Root causes, in order of
symptoms explained:

1. **Worklets are never disposed.** `QuiverAudioNode.dispose()` has zero call
   sites; unmount cleanups cancel rAF handles only. Every rig instrument's worklet
   survives Gatsby navigation, still wired to `ctx.destination`. Revisiting a page
   boots a fresh worklet next to the leaked one. With `?preset=runaway`, the leak
   is a full-level drone on every subsequent page until hard reload.
2. **Tape hiss is injected inside the feedback loop** (`patch.ts` noise→tape.in),
   so a booted rig is *never silent again* — mud settles near 0.10 amplitude of
   perpetual noise with no input.
3. **No arbiter.** The grammar page can run five worklets at once; two-cycles has
   three independent unsynced Cycles transports; nothing stops A when B starts.
4. **No stop affordance.** Swells and NotCommitting have *no* control that can
   silence a tail; Rig and BeepingDroning require knowing a fader dragged to zero
   is the stop. Tails run to ~8 minutes at high feedback.
5. **Async boot race.** `liveRef` is set only after `await createRig` — a chord
   (the normal gesture) spawns duplicate, unreachable worklets. Key-repeat on the
   Rig pad multiplies it.
6. **`AudioContext.resume()` is nobody's job.** The context singleton's comment
   says callers resume it; no caller does. On Safari/iOS a suspended context boots
   "successfully" and stays silent while the UI reads "Audio running".
7. **BeepingDroning's window-level A–K key listener** ignores focus — typing into
   SequencePlan's text inputs on the same page plays notes and boots audio.
8. **Touch interaction is unguarded** (client report, 14 Aug): tapping controls
   selects surrounding text and "does a bunch of random stuff" — the classic
   symptoms of interactive surfaces missing `touch-action` (pad presses and bench
   drags fight the browser's scroll/double-tap-zoom gestures) and
   `user-select: none` (rapid taps select labels; long-press pops the selection
   callout / context menu on iOS).

### Work

- [ ] **ADR-047: the audio lifecycle model.** One decision that fixes the
      contract: a page-level audio arbiter owns every sounding engine; starting an
      instrument hands the token to it and *fades the previous holder to silence*;
      unmount and route-change dispose worklets (fast fade, then
      `dispose()`/disconnect); the context suspends when nothing holds the token.
      Hiss stays — it is the tape's honesty — but moves out of the recirculating
      path so silence is reachable (feed hiss post-loop, gated by engine
      liveness). Document what a "stop" means per instrument.
- [ ] Arbiter implemented in `src/audio/` (pure logic + thin React binding),
      every instrument registered; `client.reset()` wipes tape on preset switch
      where the lesson doesn't need the carry-over (Rig presets document which
      presets deliberately inherit tape).
- [ ] Dispose-on-unmount and dispose-on-route-change for every rig instrument;
      held-oscillator release in every cleanup (BeepingDroning, AvoidingMud,
      ThreeNotes); boot race fixed (set the guard before the await).
- [ ] Every sounding instrument gets a visible, consistent **stop**: the same
      control in the same place, plus a "what's sounding" indicator wired to the
      arbiter (the spine already knows heat — give it a click target: silence
      everything).
- [ ] `resume()` on every start gesture; suspended-context state surfaced
      honestly in the UI instead of "Audio running".
- [ ] BeepingDroning keys scoped to focus-within (pads stay keyboard-accessible;
      typing in another instrument's inputs never sounds a note).
- [ ] Cycles embeds on one page share exclusivity (starting one stops the
      others); lookahead strikes cancelled on stop.
- [ ] **Touch hardening on every interactive surface:** `touch-action: none` on
      pads, faders, beat grids and the bench drag (`manipulation` where scrolling
      must survive, e.g. preset rows); `user-select: none` +
      `-webkit-touch-callout: none` on all instrument chrome and labels;
      `-webkit-tap-highlight-color: transparent`; `setPointerCapture` on drag
      starts so a drag that leaves the element doesn't drop or scroll; no
      double-tap zoom on tap targets; hit targets ≥ 44 px. Verified on the
      mobile e2e project with real touch events, not mouse emulation.
- [ ] e2e: a lifecycle spec that does exactly what the audit did — boot, navigate,
      assert the destination tap is silent within the fade time; overlap spec —
      start B, assert A stopped; the suspended-context spec.

## Phase B — Instrument integration (the teaching frame)

### Findings

Best-integrated embeds (two-cycles `claps`/`drift`, grammar lessons 2 and 6,
melody `circulation`, `mud`, Fretboards) all share a three-beat frame: why to
touch it, what to do, what you should have heard. The rest are missing beats:
grammar lessons 1/4/5 and Canon end the section with no debrief; rhythm's
`discipline` embed appears two sections before its instructions; ch. 3 §3.2
(harmony) makes the site's most testable claim with no instrument; the-four-modes
describes four signal-path changes the rig could preset and embeds nothing.

### Work

- [ ] Every embed carries the three-beat frame (intro sentence · instruction ·
      debrief). Written as prose, not chrome — the voice does the work.
- [ ] Rhythm: move or re-introduce the `discipline` embed where its instruction
      lives ("let it run and watch the pulse counter" at minimum).
- [ ] Ch. 3 §3.2: a rig deep-link or small embed that lets the reader hear
      feedback level bounding harmonic rhythm.
- [ ] The four modes: preset-per-mode deep links into the rig (pure/loop/echo/
      sustain as signal-path states), so the chapter's own claim — "every mode is
      a routing" — is playable.
- [ ] Every chapter opens with what the reader will be able to *do* by the end
      (one sentence, not a syllabus).

## Phase C — The voice pass (the prose)

### Findings

The provenance infrastructure (citation chips, sources page, colophon) is good and
the chapters don't trust it: they re-narrate verification status, rights
guarantees, thinness confessions, and shipping notices inline. Worst offenders,
ranked: melody's opening ("thinnest chapter on the site… will say so rather than
pad") and closing ("the authorised text is on its way to this desk"); rhythm's
source-forensics on the 14 and its in-page rights guarantee (the third copy
site-wide); where-the-numbers-come-from's "not equipped to interpret" methodology
confession; four-modes' double "per Tamm alone". Also: where-it-came-from refers
to chapter 3 in the past tense from chapter 2; where-the-numbers-come-from links
"the rhythm chapter" to Part I instead of `/discipline/rhythm/`.

### Work

- [ ] **The sentence test, applied to every page:** does this sentence change what
      the musician plays, hears, builds, or listens for next? If not, it moves to
      the colophon/sources or is deleted. Uncertain facts get stated once in
      usable form with the chip carrying the doubt ("usually given as 14 — load
      your own count and test it").
- [ ] Rights language collapses to one home (/cycles keeps its copy; chapters
      link, never restate). Awaiting-the-book notes move to frontmatter `todos:`.
- [ ] Melody rewritten around its good middle; the two apologies deleted.
- [ ] Fix the mislink; fix the chapter-3 past-tense reference.
- [ ] Reading order: Discipline half reordered to interlock → tuning → line, with
      where-the-numbers-come-from repositioned as the half's appendix (nav, spine
      and pager follow `readingOrder.ts` — one edit).
- [ ] Re-read every page against methodology §8 after the pass (the Phase 7
      discipline, re-run).

## Phase D — The public face (DX)

### Findings

README still says "Status: specification complete, no application code yet" —
two days after launch. CONTRIBUTING promises conventions "when the Gatsby scaffold
lands". `just` is a hard prerequisite (pre-push hook) documented nowhere. Fresh
clone → `just e2e` fails opaquely (needs a build first, needs playwright browsers,
port 9000 staleness serves stale builds silently). GitHub repo has no description,
homepage, or topics. No PR/issue templates. CI runs everything twice per PR
branch.

### Work

- [ ] README rewritten: one-liner + live link + screenshot first, 3-command
      quickstart, honest repo map (src/e2e/scripts included), the gate, the spec
      pipeline paragraph, no hand-maintained counts anywhere.
- [ ] CONTRIBUTING rewritten: prerequisites (bun, just, node, playwright,
      python3), the day-to-day loop, the gate itemized, PR discipline, standing
      rules and traps (pathPrefix/withPrefix, prettier-vs-MDX comments, gatsby
      clean, sources.yaml validation) — every trap CLAUDE.md carries, human-faced.
- [ ] justfile: `setup`, `gate` (check+build+smoke+e2e — what CI actually runs),
      `e2e-file`, `rebuild` (clean+build), `kill-server`; header comment
      corrected; hooks and CI call the same recipes.
- [ ] GitHub storefront: description, homepage, topics, social-preview image;
      `homepage`/`keywords` in package.json; PR template (the gate as checklist),
      two issue templates (bug-with-browser-details, source correction).
- [ ] CI: concurrency cancel + push trigger scoped; badges in the README.

## Phase E — Beyond parity (the elevation)

Held until A–D land: A is what the client is feeling; C is what they're reading.
Candidates, to be scoped as their own numbered items once the floor is fixed: a
60-second "first loop" guided overlay on the index rig; the spine as a live
site-wide transport (what's sounding, one click to silence); mode-preset tours;
a printable practice card per grammar lesson; chapter-end "take it to your rig"
patch sheets.

---

## Sequencing

A (ADR + arbiter + disposal + stops) → C and D in parallel (prose and repo face
touch nothing A touches) → B (integration prose rides on A's affordances) → E.
Every phase lands as PRs with the full gate green, plus — new — the lifecycle e2e
from Phase A. The client merges; after merge, deploy is watched and the live page
curl-verified.
