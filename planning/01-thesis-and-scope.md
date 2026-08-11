# 01 · Thesis and scope

What the argument is, what is in, what is deliberately out.
Constrains every document after it.

---

## 1. The thesis

> The recurring object across Fripp's music is **two cycles of incommensurate length,
> and what happens when they realign.**

A tape delay is a fixed cycle running against your phrase length. Fripp's 15/16 runs
against Belew's 14/16. A room counts five claps against seven. Even the fifths tuning
is one cycle — the circle of fifths — laid across a fixed count of six strings.

**This framing is ours, not Fripp's.** It is analytical hindsight, it is defensible,
and it is never presented as something he said. Everywhere the site asserts it, it
carries a visible mark ([D-003](00-decision-log.md#d-003--editorial-claims-are-visibly-marked-in-the-ui--firm)).

### Why this thesis and not "a technique with a history"

Brief v1 produced a good gear-and-lineage site with a hole in the middle: a reader
arriving from *Discipline*, or from a Guitar Circle, found nothing addressed to them.
The tape rig is one instance of something larger. Scoping to the rig alone leaves out
the most interesting material and makes three unrelated topics out of one.

The thesis also earns its keep technically: it yields **one engine** that serves the
clapping exercise, the interlock, and the delay-versus-phrase case alike.

### The distinction the whole site turns on

Two cycles can fail to line up in two mathematically different ways. Almost every
looping resource conflates them. Separating them is the site's clearest contribution:

| | **Fixed integer offset** | **Continuous drift** |
|---|---|---|
| Pulse | one, shared | two different tempos |
| Cycle lengths | different integers | any |
| Relationships visited | a finite set | every phase, continuously |
| Return | **exact, at the LCM** | **never** |
| Examples | five against seven; the *Discipline* interlock | Reich's *Piano Phase*; a delay at an arbitrary setting |

The Cycles engine enforces this in its interface rather than explaining it in prose:
the LCM grid is *disabled* in drift mode, because there is nothing to come home to
([D-016](00-decision-log.md#d-016--offset-and-drift-are-separate-modes-and-the-grid-is-disabled-in-drift--firm)).

---

## 2. What this is

**A website.** Not a book, not a book's companion. "Book" in brief v2 was shorthand for
*a coherent long-form work you can read front to back*, and that is what this is — with
chapters, an argument, and a bibliography, delivered as a website
([D-002](00-decision-log.md#d-002--this-is-a-website-there-is-no-book--firm)).

The differentiator, stated plainly:

> Every existing Frippertronics resource is either a history article or a gear thread.
> The technique is a feedback system, the browser can run feedback systems, so **every
> concept on the site should be playable in the page.**

That has to be visible in the first three seconds, not on page four.

### Named

*Two Machines: a guide to tape-delay looping.* "Frippertronics" is Fripp's coined term
and is used descriptively inside the body. This reduces takedown surface and lets the
pre-Fripp lineage breathe — the technique was not invented by the person the coined
term names.

---

## 3. Audiences

Three, in priority order. Where they conflict, the earlier wins.

1. **A musician who wants to do this tonight.** Has a guitar and maybe one delay pedal.
   Needs: working parameters with numbers, the two-pedal idea, and the playing grammar.
   Everything must work with no guitar and no microphone, on laptop speakers, in a
   library.
2. **A reader who arrived from *Discipline*.** Wants to understand the interlock.
   Needs: the meters, the drift/offset distinction, and an honest account of where the
   numbers come from.
3. **Someone checking the history.** Wants the lineage right and the sources visible.
   Needs: the bibliography, the non-hagiographic chain, and clear marking of which
   claims are the site's own.

Explicitly **not** an audience: collectors after discography minutiae, and people
wanting tab.

---

## 4. Structure

Two halves, one thesis chapter, two engines. Detail in
[02 · Information architecture](02-information-architecture.md).

| | Part | Contains |
|---|---|---|
| **0** | The Instruments | The Rig and the Cycles engine. Persistent, deep-linkable. |
| **I** | Two Cycles | The thesis. Short. Three playable examples. Everything refers back. |
| **II** | The Machine | Mechanism · lineage · what the tape does to your music · the grammar · the four modes · building it |
| **III** | The Discipline | Where the numbers come from · rhythm · harmony and the instrument · melody |
| **IV** | The Room | Philosophy. Active listening, the proposition of hazard, the small mobile intelligent unit. |
| **V** | Listen | Annotated curriculum, ordered pedagogically rather than chronologically. |
| **VI** | Sources | Full bibliography. This is what separates a resource from content. |

**Part IV sits early in the reading order**, not last. Web readers arrive sideways from
search; the philosophy chapter is cheap to read and frames everything. (In a print work
it would be the closing argument — but see D-002, there is no print work.)

---

## 5. Scope boundaries

### In scope for v1

- Both halves, complete. **One launch, not a staged release** — client decision,
  11 Aug 2026.
- Both engines, fully built.
- All chapters written from published sources.
- Full bibliography with liveness-checked links.

### Out of scope for v1

| Excluded | Why | Revisit? |
|---|---|---|
| **Original interviews with living crafties** | v2 §5 Tier 3 calls this the largest gap in the literature and the clearest opportunity — and the highest-effort item in the plan. Client decision: out for v1. | Yes, later. The site gives you something to point at when approaching people. |
| **Hosted audio of any kind** | [D-032](00-decision-log.md#d-032--no-hosted-audio-none--firm). Legal. | Never. |
| **Aphorism collection, index, or widget** | [D-030](00-decision-log.md#d-030--no-aphorism-database-ever--firm). Legal, and the most likely takedown vector. | Never. |
| **King Crimson tab or transcription** | [D-031](00-decision-log.md#d-031--no-king-crimson-transcriptions-or-tab--firm). Legal. | Never. |
| **Commercial anything** | [D-033](00-decision-log.md#d-033--non-commercial--firm). No ads, no affiliates on gear pages, no merch. | Never. |
| **A desktop/CPAL build** | v1 §2.6 floated it. The DSP now comes from quiver, which already has that story; duplicating it here is scope creep. | Belongs in quiver, not here. |
| **User accounts, saved patches, sharing** | Nothing in either brief asks for it and it drags in a backend. Presets are URL state. | Only if a real need appears. |

### Consequences of "one launch"

Choosing a single launch over a staged Machine-half release means:

- **Chapter 10 (Melody) is the weakest chapter and ships anyway.** v2 §2.4 concedes it
  is the thinnest of the four theory sections and needs the most original work — which
  is exactly the work now out of scope. It must be honest about its own thinness rather
  than padded.
- **Tier 1 sources gate the launch, not a later phase.** Robertson, Tamm,
  *The Guitar Circle* and *Bruford and the Beat* must all be in hand before chapters 7–10
  can be written. See [13 · Roadmap](13-roadmap.md) — this is the critical path, and it
  is a procurement problem before it is a writing problem.
- **No opportunity to learn from real readers** between the halves. Mitigated by
  shipping the engines to a URL early as a private preview.

---

## 6. What "done" means

The site is done when a musician can:

1. Understand the mechanism in four sentences and one diagram.
2. Set a delay time by dragging two machines apart, and say why 3–5 seconds.
3. Play three notes, stop, and hear why stopping is the lesson.
4. Overload a loop into mud deliberately, and pull it back.
5. Hear five against seven realign at 35, and say why 35.
6. Say what is different about a 15/16 line against a 14/16 line — and why that is *not*
   Reich.
7. Find every claim's source in one click.

If a chapter does not move a reader toward one of those, it is decoration.
