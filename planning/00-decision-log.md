# Decision log

Every binding decision, numbered. Format is deliberately close to an ADR: what was
decided, why, what it costs to reverse. A decision is not a preference — if it can be
changed on a whim it belongs in a spec document, not here.

**Status values:** `firm` (reversing is expensive or invalidates work) · `soft`
(reversible cheaply) · `provisional` (decided so work can proceed; expected to be
revisited) · `superseded`.

---

## Product and argument

### D-001 · The site is organised around the two-cycles thesis · `firm`
Two cycles of incommensurate length, and what happens when they realign. Chosen over
v1's "a technique with a history" because it unifies the tape rig, the *Discipline*
interlock, the clapping exercise and the fifths tuning into one subject rather than
three, and because it gives one engine that serves all of them.
**Reversal cost:** high — it determines the IA, both engines, and the title.
**Source:** brief v2 §0.

### D-002 · This is a website. There is no book · `firm`
v2 §3 discusses a "site vs book divergence" and treats the book as a possible primary
artefact. **Client correction, 11 Aug 2026: there is no book.** "Book" in the brief was
shorthand for *the site as a coherent long-form work* — a thing you read front to back,
with chapters — not a print product.

Consequences, and they are load-bearing:
- No print-versus-web voice question. One voice, written for the web.
- Part 0 is not an appendix. The simulator **is** the reason the site exists.
- The commercial-use half of the aphorism problem disappears: a non-commercial website
  sits inside Fripp's stated terms, where a book for sale would not.
- v2 §6.2 ("a book changes the aphorism calculus completely") is **moot**. We still
  quote sparingly under [D-030](#d-030--no-aphorism-database-ever--firm), but the
  DGM permission letter is optional courtesy rather than a legal necessity.

Chapter ordering still follows the web convention v2 §3 recommends: the philosophy
chapter comes **early**, because readers arrive sideways from search rather than at
page one.
**Reversal cost:** low.

### D-003 · Editorial claims are visibly marked in the UI · `firm`
The canon framing, the two-cycles thesis and the harmonic-rhythm claim are ours, not
Fripp's. Each carries a marked chip in the chrome, not a footnote. v2 §1.4 asks for the
boundary to stay visible; a guide honest about which claims are its own is more
trustworthy, not less.
**Reversal cost:** low.

### D-004 · Descriptive title, coined term used inside · `firm`
*Two Machines: a guide to tape-delay looping*. "Frippertronics" is Fripp's coined term
and appears descriptively in the body. Reduces takedown surface and lets the pre-Fripp
lineage breathe.
**Reversal cost:** low now, high after launch (URLs, inbound links).

### D-005 · Non-hagiographic lineage is a launch requirement, not a nicety · `firm`
Schaeffer/Poullin → Conrad → Riley → Oliveros → Eno → Fripp, with Schellinx's point
that the technique arrived with the machine. Getting this wrong costs credibility
immediately and irrecoverably.
**Reversal cost:** n/a — this is a correctness constraint.

---

## Engines

### D-010 · Delay time is set as a physical distance · `firm`
The hero interaction is dragging two decks apart, with a readout in both centimetres
and seconds, not a millisecond slider. This is the single gesture that teaches what
every text explanation fumbles.
**Reversal cost:** high — it is the reason the Rig exists.
**Validated:** yes, in `mockups/l-the-rig.html`.

### D-011 · Pixels map to centimetres at a constant scale · `firm`
Consequence: a floor of roughly 1.5 s at full desktop width, because two touching decks
still have about a deck's width of tape between their head assemblies. Accepted, and
physically honest. The alternative — a scale that stretches as you drag — makes the
ruler a lie.
**Reversal cost:** low.
**Departs from brief:** v1 §2.2 specifies a 0.5–8 s range. Sub-1.5 s delays are reached
via the M-size instruments, which use a seconds fader and no bench.

### D-012 · Monitor and record head are separate nodes from the first commit · `firm`
Fripp's two volume pedals. `monitor` (dry to room) and `recordHead` (into the delay
line) are independent gains, so "solo without committing anything" is a capability
rather than a diagram. v2 §1.3 argues this is the most important technical detail on
the site.
**Reversal cost:** high — retrofitting a split into a single-tap graph touches every
preset.

### D-013 · Saturation sits on the feedback path · `firm`
A `tanh` waveshaper before the feedback gain. Without it, feedback at or past unity
clips digitally instead of turning to mud, and the near-unity lesson is unplayable.
Tape compresses; a bare gain node does not.
**Reversal cost:** low technically, high pedagogically.
**Validated:** yes.

### D-014 · Delay time is ramped, and the pitch glide is kept · `firm`
`setTargetAtTime`, not `.value =`. Dragging a deck glides in pitch exactly as sliding a
real machine along a bench does. The artifact is the honest behaviour.
**Reversal cost:** low.
**Departs from brief:** v1 §2.5 cites the Pd anti-click ramp as a technique to avoid
artefacts; we keep the artefact deliberately in the Rig, and mention the ramp in the
build chapter as the technique for when you *don't* want it.

### D-015 · One `AudioContext` for the entire site · `firm`
Created lazily on first user gesture, shared by both engines. Both engine modules
import the same accessor. Never more than one, ever.
**Reversal cost:** medium.

### D-016 · Offset and drift are separate modes, and the grid is disabled in drift · `firm`
Fixed integer offset (finite orbit, exact return at the LCM) and continuous drift (no
return, ever) are different mathematical objects. The LCM grid is *disabled* in drift
because there is nothing to come home to. v2 §1.1 argues most looping literature
conflates them; refusing to blur it in the UI is the site's clearest contribution.
**Reversal cost:** high — it is the thesis, expressed as an interaction.
**Validated:** yes.

### D-017 · The Cycles engine models meters, never parts · `firm`
Presets carry a cycle length and a downbeat. Timbres are generic strikes. Any pattern
beyond the downbeat is built by the user. Guarantee is printed on the engine page.
See [D-031](#d-031--no-king-crimson-transcriptions-or-tab--firm).
**Reversal cost:** n/a — legal constraint.

### D-018 · `longestInterlock` is the number we print · `firm`
`longestGap` is the interval between coincidences (18 for five-against-seven);
`longestInterlock` is the count of beats between them, on which nothing agrees (17).
The second is musically meaningful and matches the existing five-against-seven page.
Both are exported; the UI prints the second.
**Reversal cost:** low, but silently swapping them makes two pages disagree.

### D-019 · Lookahead scheduling, not `setInterval` alone · `firm`
A 25 ms timer books events 120 ms ahead on the audio clock; a queue feeds the paint
loop at the moment each event is heard. Per Chris Wilson's *A Tale of Two Clocks*.
`setInterval` alone is far too jittery to hear five against seven honestly.
**Reversal cost:** medium.

---

## Design

### D-020 · Colour is semantic, not decorative · `firm`
Brass = machine one = record = what you commit. Aqua = machine two = play = what comes
back. Unison = both. Runaway = past unity. Every accent answers *which machine is this?*
**Reversal cost:** medium — it is applied consistently across both engines.

### D-021 · The size ladder is a budget, and there are two L's · `firm`
XS / S / M / L / Page, each fixing how many controls an exercise may show and where it
may appear. Anything that outgrows its budget is promoted or cut.
**Reversal cost:** low.
**Departs from brief:** the ladder originally allowed exactly one L (the Rig). v2 forces
a second (Cycles). Resolved as **one L per half** — the Machine gets the Rig, the
Discipline gets Cycles. A third L requires a third half, which is a reason to say no.

### D-022 · One page-level effect: the spine · `firm`
A single continuous line down the left margin, brightness tracking the running
instrument's feedback level. No scroll-jacking. No second effect. One idea executed
precisely rather than five.
**Reversal cost:** low.

### D-042 · The mobile Rig is a scrollable bench at fixed scale · `firm`
Below ~600px the viewport becomes a window onto a bench longer than the screen. The
px↔cm scale does **not** change with viewport width, so the ruler stays true and the
teaching claim survives. Rejected: a seconds-fader fallback, which would give phone
readers the ordinary millisecond slider every other site has, on the most common device.
**Risk:** gesture conflict. `touch-action: pan-y` on the bench so vertical page scroll
always wins; deck drag moves a deck, background drag pans the view.
**Reversal cost:** low. **Execution unproven** — prototype at 375px before Phase 6.

### D-043 · Canvas accessibility is solved by generated descriptions, not SVG · `firm`
Every canvas view generates a real prose description of the pattern from state, as its
accessible alternative and as a disclosure available to everyone. Rejected: an SVG grid
with per-cell elements — tabbing 210 cells is the same data in a worse order, not
comprehension.
**Honest residual:** a description is an interpretation, and a sighted reader can notice
what we did not describe. Offering the disclosure to everyone is a mitigation, not a cure.
**Reversal cost:** low.

### D-044 · Chapter 7's interactive demonstrates the acoustic fact and reports the doctrine · `firm`
The Law of Seven rests on something true: the diatonic octave really does have semitone
steps at mi→fa and si→do. The interactive demonstrates **that**, and reports Gurdjieff's
cosmological reading of those gaps as *doctrine*, behind an explicit toggle.

It must **not** be a playable seven-beat cycle. Everything else playable on this site is
demonstrably true; a seven-cycle here would put a metaphysical claim on the same footing
as the arithmetic — and would answer by implication a question v2 §5 explicitly leaves
open (whether the seven-based clapping patterns are doctrinal or a convenient prime).
That question is stated as open on the page.
**Reversal cost:** low.
**Register:** report, do not endorse; explain, do not sneer.

### D-023 · Not beige tape nostalgia · `firm`
Ground is deep indigo. The reference set is the *Discreet Music* schematic, splicing
geometry, VU ballistics and the Revox grey-and-orange — not warm cream, serif and
terracotta, which every ambient-guitar site already uses.
**Reversal cost:** low.

---

## Engineering

### D-024 · Gatsby 5 + TypeScript strict · `firm`
Chosen by the client over the brief's Astro suggestion. Matches the conventions in
`websites/alexnodeland`, which is the working reference for structure, lint, format and
deploy.
**Reversal cost:** high.
**Departs from brief:** v1 §2.5 recommends Astro. Client decision overrides.

### D-025 · Bun is the package manager and script runner; Node is the runtime · `firm`
`bun install`, `bun run`. Gatsby itself still executes on Node. This is not a full Bun
stack and the docs should not imply it is.
**Reversal cost:** low.
**Known sharp edge:** Bun skips dependency lifecycle scripts by default;
`gatsby-plugin-sharp` and friends need `trustedDependencies`. See [07](07-tech-stack.md).

### D-026 · Vitest, with 100% thresholds and `all: true` · `firm`
`all: true` is non-negotiable: without it, 100% is reachable by simply not importing
your worst module. Thresholds enforced in CI from the first commit.
**Reversal cost:** low to configure, high to retrofit if allowed to lapse.

### D-027 · Engines are split pure-from-wiring · `firm`
`Tape.curves` and `Cycles.math` contain only pure functions of numbers and touch no
`AudioContext`. That half is trivially covered. The node-graph half is covered against a
mock. Real DSP behaviour is verified separately in a browser. This seam is the reason
100% is achievable rather than aspirational.
**Reversal cost:** high — it is the testing strategy.

### D-028 · jsdom cannot test Web Audio; three-tier strategy instead · `firm`
jsdom does not implement Web Audio. Tier 1 pure math in node. Tier 2 graph construction
against a mock context. Tier 3 actual audio behaviour in a real browser via
`OfflineAudioContext` under Playwright. Coverage thresholds apply to tiers 1–2.
**Reversal cost:** medium.

### D-029 · GitHub Pages project page, therefore `pathPrefix` IS required · `firm`
Ships at `alexnodeland.github.io/two-machines`. That is a project page, not a custom
domain, so Gatsby needs `pathPrefix: "/two-machines"` in `gatsby-config.ts` **and**
`--prefix-paths` on the build command. Both, or asset URLs break.

Three consequences that bite specifically here:
- **No `CNAME` file.** Adding one without DNS breaks the deployment.
- **Every hand-written internal URL must go through Gatsby's `withPrefix`/`Link`.** A
  raw `<a href="/chapter-3">` works locally and 404s in production. This includes the
  **AudioWorklet and `.wasm` URLs** — see [D-037](#d-037--worklet-and-wasm-urls-must-be-prefix-aware--firm),
  which is the single most likely way this decision breaks the site silently.
- **Moving to a custom domain later means deleting the prefix**, not adding to it —
  Gatsby's docs are explicit that a `pathPrefix` on a custom domain breaks navigation.
  The prefix therefore lives in exactly one constant.

Restore only `.cache` in CI, never `public/`.
**Reversal cost:** low, but getting it wrong ships a green build and a broken site.

---

## Quiver

*Client decision, 11 Aug 2026: the DSP comes from `quiver`, the client's own Rust
audio-synthesis library, rather than from hand-built Web Audio nodes. The site remains
fully TypeScript; quiver arrives as compiled WebAssembly.*

### D-035 · The rig is a quiver patch running in an AudioWorklet · `firm`
Delay, filtering, saturation and analog drift all run inside one compiled quiver patch
on the audio thread. Quiver removed `createAudioContext`; `createQuiverAudioNode` is the
only supported browser path, so this is not a preference but the shape of the library.
The Web Audio graph shrinks to: source → `QuiverAudioNode` → destination.
**Reversal cost:** high — it is the audio architecture.
**Blocked on:** D-038, D-039, D-040.
**Supersedes:** the hand-built node graph in `mockups/engine.js`, which becomes a
reference implementation and a behavioural oracle (see [08](08-testing-strategy.md)),
not the shipping engine.

### D-036 · `@quiver-dsp/wasm` is published to npm with prebuilt WebAssembly · `firm`
The site's CI installs a versioned package and never needs a Rust toolchain. Forces
quiver's public API to stabilise enough to carry a version number, which is worth doing
anyway. The alternative — a git dependency plus `wasm-pack` in the deploy workflow —
couples every site deploy to quiver's `main` and roughly doubles build time.
**Reversal cost:** medium.
**Requires of quiver:** an npm release pipeline and semver discipline on a pre-1.0
library. This is a real cost and it lands on the quiver side, not the site side.

### D-037 · Worklet and wasm URLs must be prefix-aware · `firm`
`createQuiverAudioNode` takes `workletUrl` and `wasmUrl`. Under
[D-029](#d-029--github-pages-project-page-therefore-pathprefix-is-required--firm) both
must be resolved through Gatsby's `withPrefix`. A raw `/quiver.worklet.js` loads in
`gatsby develop` and 404s in production — and because audio is initialised on a user
gesture rather than at page load, **the failure is invisible until someone presses
play**. Smoke test in CI must assert both assets resolve at the deployed prefix.
**Reversal cost:** low to fix, high to diagnose.

### D-038 · quiver gap 1 — `DelayLine` needs a longer maximum · `firm`
`MAX_DELAY_SECS` is a hard-coded `2.0`. The site needs 1.5–8 s of usable range, and
headroom above that. Proposed: make the maximum a construction parameter with the
buffer sized accordingly, defaulting to the current 2 s so no existing patch changes.
**Owner:** joint, upstream in quiver.

### D-039 · quiver gap 2 — opt-in feedback past unity · `firm`
`DelayLine` clamps feedback to `0.99` with the comment *"Prevent runaway"*. On this
site **runaway is a lesson** — v1 §2.2 says to mark the unity line and let it go past.
Proposed: an opt-in unclamped mode allowing feedback ≥ 1.0, with saturation in the loop
so the result is mud rather than a detonation. Defensible in a modular library on its
own terms: hardware self-oscillates, and refusing to is the unusual choice.
Existing NaN sanitisation already protects the buffer from latching, which makes this
materially safer to add than it would otherwise be.
**Owner:** joint, upstream in quiver.
**Safety:** the site pairs this with a hard output limiter — see [03](03-audio-engine-spec.md).

### D-040 · quiver gap 3 — a linear-seconds delay-time input · `firm`
`DelayLine` maps its time CV exponentially (`1 ms · 2000^cv`). The site's hero gesture
is linear in **centimetres of bench**, so we would be inverting an exponential and
spending most of the control range outside the 3–5 s window where the whole subject
lives. Proposed: an alternative time input taking seconds directly, leaving the
exponential CV path untouched for chorus/flanger use.
**Owner:** joint, upstream in quiver.
**Note:** quiver's existing 5 ms `smoothed_delay` slew already produces the pitch glide
[D-014](#d-014--delay-time-is-ramped-and-the-pitch-glide-is-kept--firm) asks for. That
behaviour must survive this change — it is a feature here, not a workaround.

### D-041 · The prototype engine becomes the behavioural oracle · `firm`
`mockups/engine.js` is not thrown away. Its measured behaviour — decay times at a given
feedback, the fact that a 0.9 s note is still audible 2.6 s later at 0.85 feedback — is
the reference the quiver patch is checked against. A rewrite that sounds different is a
regression until argued otherwise.
**Reversal cost:** low.

---

## Rights

### D-030 · No aphorism database, ever · `firm`
Three or four quoted in context where they do real work, each attributed and linked.
Never in bulk, never searchable, never an "aphorism of the day". Fripp's own usage terms
permit quoting some and explicitly forbid use *in toto or in bulk*, and forbid
commercial use.
**Reversal cost:** n/a — legal constraint. This is the single most likely takedown vector.

### D-031 · No King Crimson transcriptions or tab · `firm`
The *Discipline* parts are copyrighted compositions and published transcriptions are
derivative works. Describe meters, model rhythm, name the device; never print the notes.
**Reversal cost:** n/a — legal constraint.

### D-032 · No hosted audio, none · `firm`
Not clips, not "fair use" excerpts. Every listening reference links out to DGM Live,
Bandcamp or a streaming service. The site's own audio is synthesised in the browser and
is not a recording of anything.
**Reversal cost:** n/a — legal constraint.

### D-033 · Non-commercial · `firm`
No ads, no affiliate links on the gear pages, no merch. The aphorism terms alone rule
out commercial use, and the goodwill is worth more than the affiliate revenue.
**Reversal cost:** n/a.

### D-045 · The reference archive is reproducible, not committed · `firm`
`references/sources.yaml` (the directory) and `references/fetch.sh` (the fetcher) are
committed; `references/files/` is **gitignored**.

Local copies of sources are ordinary research practice and we want them — being able to
re-check a quotation months later is the difference between a bibliography and a list of
links. But most of this material is third-party and copyrighted, and a public repository
containing full texts is a **mirror, not a citation**. Tamm is the clearest case: freely
distributed by its author, and still not ours to republish.

Reproducibility replaces storage. `cd references && ./fetch.sh` rebuilds the archive.
**Reversal cost:** low, but reversing it means republishing copyrighted material, which
[11](11-rights-and-legal.md) forbids.

### D-046 · Unfetchable sources stay in the manifest · `firm`
A source we cannot currently archive keeps its entry, with `fetch.status` and a
`fetch.hint` saying what would make it work. Dropping it would lose the fact that we need
it, and would let the archive look complete when it is not.

Consequence: the manifest is a **known target list** for improving the fetcher, not just
an inventory of what we happened to get. Currently 5 `blocked` (live, but refusing
automated fetch — likely fixed by a Playwright-backed mode) and 6 `manual` (a book, a
video, a record sleeve — need a human).

The fetcher also **rejects a 200 that is really a bot-check page**, so a challenge page
can never masquerade as an archived source. This already caught one.
**Reversal cost:** low.

### D-034 · Cite Robertson rather than Gurdjieff directly · `firm`
Gurdjieff's texts vary in copyright status by edition and jurisdiction. Robertson (2017)
is peer-reviewed, open access, and summarises what we need.
**Reversal cost:** low.

---

## Reversed or superseded

*None yet.*
