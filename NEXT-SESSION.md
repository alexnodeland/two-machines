# Next session — start here

*Written 11 August 2026, end of the planning session.*

Read this, then [`planning/README.md`](planning/README.md). Nothing else is needed to
resume.

---

## Where things stand

**No application code exists yet, deliberately.** The client asked for the plan to be
settled before any more code is written. It is now settled: 16 planning documents,
46 numbered decisions, a verified bibliography, and working prototypes that were used as
evidence rather than as a foundation.

```
planning/     the specification — read 00 and 01 first
references/   41 sources, 32 archived and extracted, scripts to rebuild
mockups/      working prototypes. EVIDENCE, NOT FOUNDATION — see below
```

## The decisions most likely to surprise you

Skim [`planning/00-decision-log.md`](planning/00-decision-log.md) properly, but these
four override reasonable assumptions:

1. **There is no book.** Brief v2 talks about "the site vs the book". The client
   clarified: "book" meant *the site as a long-form work*. It's a website. This kills
   the whole aphorism-commercial-use problem (D-002).
2. **The DSP is quiver, not Web Audio nodes.** The client's own Rust library, compiled to
   WASM, running in an AudioWorklet. `mockups/engine.js` is **superseded** — it survives
   only as the behavioural oracle (D-035, D-041).
3. **`pathPrefix` is required.** Shipping at `alexnodeland.github.io/two-machines`. The
   first draft of the spec had this backwards. Worklet and wasm URLs must go through
   `withPrefix` or audio dies silently in production (D-029, D-037).
4. **One launch, everything at once.** No staged Machine-half release.

## Do this next

### 1. Per-chapter planning pass — the agreed next step

Every page in [`planning/02-information-architecture.md`](planning/02-information-architecture.md)
gets its own document in `planning/chapters/`, following the template in
[10 §3](planning/10-content-methodology.md#3-chapter-template).

**Start with Part I, the thesis chapter.** Writing it is the real test of whether the
two-cycles argument survives contact with prose. If it doesn't, the IA and both engines
change, so find out before building anything.

### 2. Open the three quiver issues

They block all audio, and they're upstream work in `libraries/quiver`:

- **D-038** — `DelayLine::MAX_DELAY_SECS` is hard-coded `2.0`; we need 8 s.
- **D-039** — feedback clamps at `0.99`; here, runaway past unity *is a lesson*.
- **D-040** — the time CV is exponential; our gesture is linear in centimetres.
  **Whatever changes, the existing 5 ms `smoothed_delay` slew must survive** — it
  produces the pitch glide we want.

Details in [`planning/03-audio-engine-spec.md` §6](planning/03-audio-engine-spec.md#6-three-gaps-in-quiver-and-how-they-are-closed).

### 3. Collect what a script can't

`references/collect.html` — open it in a browser. Seven sources, two of which block a
chapter. Drop files in `references/inbox/`, run `node extract.mjs`.

## Standing rules that are easy to break

- **`references/files/` is never committed.** Copyrighted material; the manifest and
  scripts are what's in git (D-045).
- **No hand-written files in `references/files/`.** They rot. A source only readable by
  hand gets quoted into `planning/12-references.md` with a date instead.
- **Editorial claims wear a visible mark and never carry a citation.** A footnote on our
  own analysis launders opinion into apparent fact (D-003).
- **Meters only for King Crimson.** Cycle length and downbeat; never a pattern (D-031).
- **Aphorism cap is four, site-wide.** Not five (D-030).
- **`longestInterlock` (17) is what the UI prints**, not `longestGap` (18). Two pages
  quote this number (D-018).

## About the mockups

`mockups/` runs — `cd mockups && python3 -m http.server 8742`. Five prototypes plus the
client's original five-against-seven page.

They are **evidence**, not a starting point. Their value is that the load-bearing claims
in specs 03 and 04 were *played* before they were written down: the two-tap pedal split,
saturation making unity musical, the drift/offset distinction, the LCM grid. Where a
mockup and a document disagree, **the document is right and the mockup is stale.**

`mockups/engine.js` in particular is superseded by quiver but is the numeric oracle for
[03 §8](planning/03-audio-engine-spec.md#8-behavioural-contract) — a 0.9 s note at 0.85
feedback is still audible 2.6 s later, and the quiver patch has to reproduce that.

## Unresolved, and worth resolving early

From [`planning/14-open-questions.md`](planning/14-open-questions.md):

- **Q-02** the *Discreet Music* diagram — blocks chapter 1
- **Q-03** a third independent source for the *Discipline* meters — the two findable ones
  carry identical text, so they are one source
- **Q-07** whether the circular loop face survives, given the Cycles dials are also
  circular and the site allows itself exactly one page-level effect

## Things I got wrong, so you don't repeat them

- Wrote `pathPrefix` backwards on the first pass (assumed custom domain).
- Hand-maintained counts in `sources.yaml` drifted within an hour. Deleted them;
  `./fetch.sh --verify` reports live totals. **Don't reintroduce them.**
- The fetch script's own YAML parser is more forgiving than a real one. Validate with
  `python3 -c "import yaml; yaml.safe_load(open('references/sources.yaml'))"` after
  editing the manifest.
- A 75 KB saved **error page** sat in the archive undetected because it passed every
  byte-count check. Word count caught it. Size is not an integrity check.

## Repository

Local git only, no remote, initialised at the end of the planning session. Commit before
starting anything substantial so the plan is a clean baseline.
