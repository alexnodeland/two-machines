# 03 · Audio engine

The tape-delay engine. Signal path, parameters, scheduling, and the contract the rest
of the site programs against.

**The DSP is quiver**, the client's Rust audio-synthesis library, compiled to
WebAssembly and running in an AudioWorklet
([D-035](00-decision-log.md#d-035--the-rig-is-a-quiver-patch-running-in-an-audioworklet--firm)).
The site is TypeScript; no DSP is written in TypeScript.

---

## 1. The thing being modelled

Two reel-to-reel decks side by side, classically Revox A77s. One reel of tape feeds from
machine one's supply reel, past its heads, across the gap, past machine two's heads, onto
machine two's take-up reel. **Machine one records. Machine two plays. Machine two's line
out returns to machine one's line in.**

Four facts the engine must make true, not merely gesture at:

1. **Delay time is the physical distance between the machines.** Typically 3–5 seconds.
   A time constant you can walk across.
2. **Repeats/decay is the playback machine's output level** feeding back into the
   recorder. Below unity it decays; near unity it accumulates toward mud, and past it,
   chaos.
3. **The recording is a by-product of the mechanism**, not a separate act. The
   performance ends up on the tape as it winds onto machine two.
4. **It is not strictly a loop.** The tape runs machine to machine and does not return.
   It behaves as a loop only because the *signal* is fed back.

---

## 2. Signal path

Eno's *Discreet Music* schematic, expressed as a quiver patch.

```
                 ┌──────────────── recordHead (Vca) ──────────────┐
                 │            machine one's record level          │
 source ─────────┤                                                ▼
 (pad / mic)     │                                        ┌─► [ DelayLine ]  the span of tape
                 │                                        │       │
                 └──── monitor (Vca) ──────┐              │       ▼
                       what the room hears  │             │  HighFrequencyRolloff   worn heads
                       of you, now          │             │       │
                                            │             │       ▼
                                            │             │   Saturator             tape compression
                                            │             │       │
                                            │             │       ├──► feedback (Vca) ──┘
                                            │             │       │    machine two's
                                            │             │       │    playback level
                                            │             │       ▼
                                            │             │    loopOut (Vca)
                                            │             │       │
                                            ▼             │       ▼
                                          master (Vca) ◄──┴───────┘
                                            │
                                            ▼
                                        Limiter                  safety, not colour
                                            │
                                            ▼
                                     worklet output
```

### Why each stage exists

| Stage | quiver module | Why it is load-bearing |
|---|---|---|
| `recordHead` | `Vca` | Fripp's **first** volume pedal — how much of you goes onto the tape. Zero here means you can play over the loop committing nothing. |
| `monitor` | `Vca` | Fripp's **second** volume pedal — how much of you the room hears now. Independent of the first. |
| `DelayLine` | `timefx::DelayLine` | The span of tape. Delay time in seconds, set by bench distance. |
| `HighFrequencyRolloff` | `analog::HighFrequencyRolloff` | Each pass loses top end. Decay must **colour**, not merely fade. |
| `Saturator` | `analog::Saturator` | Tape compresses. This is why feedback at unity becomes mud rather than digital clipping. |
| `feedback` | `Vca` | Machine two's output back into machine one. **The entire idea.** |
| `loopOut` | `Vca` | What the room hears of the tape, separately from the dry monitor. |
| `Limiter` | `dynamics::Limiter` | Safety only. See §6. |

### The two-tap split is the whole point

`monitor` and `loopOut` are **separate taps to the room**, and `recordHead` is separate
from both. That is the two-volume-pedal technique
([D-012](00-decision-log.md#d-012--monitor-and-record-head-are-separate-nodes-from-the-first-commit--firm)),
and it is why Fripp can solo audibly without committing a note. Every modern equivalent —
delay off with trails engaged, a record-enable footswitch, input gain before the loop —
is taught as an instance of this one idea, not as a separate pedal tip.

---

## 3. Parameters

The public contract. Controls are named after the physical thing, never the DSP
parameter.

| Control | Underneath | Range | Default | Notes |
|---|---|---|---|---|
| Machine distance | delay time | 1.5–8 s | 4.2 s | Set by dragging; readout in cm **and** s |
| Tape speed | cm↔s conversion | 3¾ / 7½ / 15 ips | 7½ | 7½ ips = 19.05 cm/s |
| Playback level | feedback gain | 0–1.18 | 0.75 | **Unity marked at 1.0**; above is runaway |
| Record head | input to delay line | 0–1.2 | 0.85 | Pedal one |
| Monitor | dry to room | 0–1.2 | 0.85 | Pedal two |
| Loop out | wet to room | 0–1.2 | 0.95 | |
| Tape age | rolloff + drift + hiss | 0–1 | 0.35 | One knob, three effects |
| Master | output | 0–1.2 | 0.90 | Pre-limiter |

### Derived readouts

Pure functions, no audio access, fully unit-tested:

```
distanceToSeconds(cm, speed)     = cm / speedCmPerSec
repeatsToInaudible(feedback)     = log(0.001) / log(feedback)      // ∞ at feedback ≥ 1
decayTime(feedback, delay)       = repeatsToInaudible × delay
feedbackState(feedback)          → sparse | decaying | accumulating | near unity | runaway
```

`repeatsToInaudible` returning `Infinity` at unity is not an edge case to be defended
against — **it is the definition of runaway**, and the UI prints it as such.

### Tape age maps to three things at once

One knob, because on a real machine there is no separate control:

- **Rolloff cutoff:** 16 kHz fresh → ~880 Hz worn, exponentially.
- **Wow and flutter:** a slow (~0.47 Hz) and a fast (~6.3 Hz) wobble on delay time.
- **Hiss:** injected *into the loop*, so it accumulates with the music rather than
  sitting on top of it.

---

## 4. Sources

The site must be **fully usable with no microphone and no guitar**, on laptop speakers,
in a library. That is a floor, not a nice-to-have
([06 · Accessibility](06-accessibility-and-interaction.md)).

| Source | Purpose |
|---|---|
| **Tone pads** | The default instrument. Click-and-hold sustained tones; a pad per lesson, tuned to that lesson's key. |
| **Plucked figure** | For lessons needing a struck attack and for the canon demo's repeating phrase. |
| **Microphone** | Where granted. `echoCancellation`, `noiseSuppression` and `autoGainControl` **all off** — they destroy the thing being taught. |

Never assume a guitar. Never require a microphone. Never autoplay.

---

## 5. Quiver integration

### The boundary

```
  React components  ──►  useRig() hook  ──►  RigController (TS)
                                                   │
                                          createQuiverAudioNode()
                                                   │
                                    ┌──────────────┴──────────────┐
                                    │   AudioWorklet (audio thread)│
                                    │   quiver patch (WASM)        │
                                    └──────────────────────────────┘
```

- `createQuiverAudioNode(audioContext, { workletUrl, wasmUrl })` is the **only**
  supported path; quiver removed `createAudioContext`.
- The Web Audio graph on the main thread is trivially small: `source → QuiverAudioNode
  → destination`.
- Parameter changes go through `setParam` via `postMessage`. They are therefore
  **asynchronous and coalesced** — see §7.
- One `AudioContext` for the entire site, shared with the Cycles engine
  ([D-015](00-decision-log.md#d-015--one-audiocontext-for-the-entire-site--firm)).

### URLs must be prefix-aware

`workletUrl` and `wasmUrl` must resolve through Gatsby's `withPrefix`. A raw
`/quiver.worklet.js` works in `gatsby develop` and 404s in production. Because audio
initialises on a user gesture rather than at page load, **the failure is invisible until
someone presses play**
([D-037](00-decision-log.md#d-037--worklet-and-wasm-urls-must-be-prefix-aware--firm)).
CI asserts both resolve at the deployed prefix.

### Dependency

`@quiver-dsp/wasm`, published to npm with prebuilt WebAssembly
([D-036](00-decision-log.md#d-036--quiver-dspwasm-is-published-to-npm-with-prebuilt-webassembly--firm)).
The site's CI never installs a Rust toolchain.

---

## 6. Three gaps in quiver, and how they are closed

These block [D-035](00-decision-log.md#d-035--the-rig-is-a-quiver-patch-running-in-an-audioworklet--firm).
All three are upstream work in quiver, done jointly.

### Gap 1 — maximum delay time

`DelayLine::MAX_DELAY_SECS` is a hard-coded `2.0`. The site needs 1.5–8 s of usable
range with headroom above.

**Proposal:** make the maximum a construction parameter, sizing the buffer accordingly,
defaulting to the current 2 s so no existing patch changes behaviour.
Memory cost at 8 s: `8 × 48000 × 8 bytes ≈ 3 MB` per delay line at f64. Acceptable for
one delay; worth noting if quiver later wants f32 buffers.

### Gap 2 — feedback past unity

`DelayLine` clamps feedback to `0.99` with the comment *"Prevent runaway"*. **On this
site runaway is a lesson** — v1 §2.2 says explicitly to mark the unity line and let it
go past.

**Proposal:** an opt-in unclamped mode allowing feedback ≥ 1.0. Defensible in a modular
library on its own terms — hardware self-oscillates, and refusing to is the unusual
choice.

Three things make this safe rather than reckless:
- **`Saturator` sits inside the loop.** Growth is bounded by the saturation curve, so
  the result is mud, not a detonation.
- **`Limiter` sits on the output.** A hard ceiling that is safety, never colour.
- **quiver already sanitises non-finite input** so a NaN cannot latch in the feedback
  buffer. That protection is what makes this materially safer to add.

### Gap 3 — a linear-seconds delay-time input

`DelayLine` maps its time CV exponentially (`1 ms · 2000^cv`). The site's hero gesture is
**linear in centimetres of bench**, so we would be inverting an exponential and spending
most of the control range outside the 3–5 s window where the entire subject lives.

**Proposal:** an alternative time input taking seconds directly, leaving the exponential
CV path untouched for chorus and flanger use.

**Constraint:** quiver's existing 5 ms `smoothed_delay` slew already produces exactly the
pitch glide [D-014](00-decision-log.md#d-014--delay-time-is-ramped-and-the-pitch-glide-is-kept--firm)
asks for — dragging a deck bends pitch the way sliding a real machine does. **That
behaviour must survive this change.** It is a feature here, not a workaround.

---

## 7. Scheduling and timing

Per Chris Wilson's *A Tale of Two Clocks*: the UI thread cannot be trusted for musical
timing, so it books events ahead on the audio clock.

| | Value | Why |
|---|---|---|
| Timer interval | 25 ms | Frequent enough to survive a blocked main thread |
| Lookahead | 120 ms | Comfortably longer than a dropped frame |
| Paint latency compensation | 12 ms | Visuals fire when audio is *heard*, not when scheduled |

Audio events are pushed to a queue with their audio-clock timestamp; the render loop
drains events whose time has passed. **Visuals follow audio, never the reverse.**

`setParam` crosses a thread boundary by `postMessage`, so it is asynchronous. Continuous
gestures — dragging a deck — must be **coalesced to one message per animation frame**,
not one per pointer event. Sending per-event floods the worklet's message queue and
produces exactly the zipper artefacts the slew is there to prevent.

---

## 8. Behavioural contract

The prototype `mockups/engine.js` is the **behavioural oracle**
([D-041](00-decision-log.md#d-041--the-prototype-engine-becomes-the-behavioural-oracle--firm)).
The quiver patch must reproduce its measured behaviour; sounding different is a
regression until argued otherwise.

Measured on the prototype, to be re-asserted against quiver:

| Assertion | Measured |
|---|---|
| Silence before input | peak = 0 |
| A 0.9 s note at 0.85 feedback is still audible 2.6 s later | peak ≈ 0.069 |
| Feedback 0 → one pass, then silence | — |
| Feedback ≥ 1.0 → level is non-decreasing over 10 s | — |
| Feedback ≥ 1.0 → output never exceeds the limiter ceiling | — |
| `recordHead` = 0 → dry audible, nothing enters the loop | — |
| `monitor` = 0, loop running → tape audible, live playing silent | — |
| Tape age 1.0 → measurable HF loss per pass | — |

Verified by rendering through `OfflineAudioContext` in a real browser
([08 · Testing](08-testing-strategy.md) tier 3). jsdom cannot do this — it does not
implement Web Audio at all.

---

## 9. Presets

Every lesson deep-links the Rig with settings and a prompt. Presets are URL state,
shareable, and validated on read — a hand-edited URL must never put the engine into an
unsafe state.

| Preset | Distance | Feedback | Record | Monitor | Age | Teaches |
|---|---|---|---|---|---|---|
| `default` | 4.2 s | 0.75 | 0.85 | 0.85 | 0.35 | — |
| `three-notes` | 3.5 s | 0.80 | 0.90 | 0.80 | 0.30 | grammar 1 |
| `beeping` | 4.0 s | 0.78 | 0.90 | 0.75 | 0.34 | grammar 2 |
| `not-committing` | 4.5 s | 0.82 | **0.00** | 0.90 | 0.35 | grammar 3 — the split |
| `mud` | 3.0 s | **0.96** | 1.00 | 0.70 | 0.55 | grammar 4 — deliberate failure |
| `swells` | 5.0 s | 0.80 | 0.85 | 0.60 | 0.40 | grammar 5 |
| `runaway` | 2.5 s | **1.06** | 0.80 | 0.60 | 0.50 | past unity, safely |
| `authentic` | 3.2 s | 0.75 | 0.85 | 0.85 | 0.45 | Revox-era numbers |

---

## 10. Open items

- Exact `Saturator` drive and `Limiter` ceiling need tuning against the oracle in §8.
- Whether `ComponentModel`/`ThermalModel` drift is worth enabling, or whether the
  explicit wow/flutter LFOs are enough. Prefer quiver's own model if it sounds right.
- Stereo. The prototype is mono. Real Frippertronics is mono at the tape; Soundscapes is
  emphatically not. Deferred to [14 · Open questions](14-open-questions.md).
