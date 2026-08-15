---
title: "Bibliography"
last_updated: 2026-08-15
related_adrs: ["003", "029", "030", "034"]
---

# Bibliography

The **prose companion** to the reference directory. The machine-readable master is
[`references/sources.yaml`](../../references/sources.yaml); `/sources` is generated from
that, and no claim ships without an entry in it.

This document exists for the parts a YAML file is bad at: the corrections in §0, the
verified quotations, and the reasoning about which sources can carry which claims.

> **Offline copies.** Every fetchable source is archived locally by
> [`references/fetch.sh`](../../references/fetch.sh). `references/files/` is **gitignored** —
> most of this is third-party copyrighted material, and committing it would be
> republication rather than citation ([Rights and legal §3](rights-and-legal.md#3-third-party-material)).
> The manifest and the script are committed, so the archive is reproducible:
> `cd references && ./fetch.sh`.
>
> Raw HTML is passed through [Defuddle](https://github.com/kepano/defuddle), so what
> lands in `references/files/` is clean Markdown with frontmatter, not 280 KB of
> navigation chrome.
>
> **41 sources tracked · 32 archived and extracted · 9 needing a human**, each of the
> nine listed with what to get and where. See
> [`references/README.md`](../../references/README.md).

Every URL below was checked on the date shown. Status is recorded honestly: a 403 to an
automated fetch is not the same as a dead link, and the distinction is noted where it
applies.

**Last full verification pass: 11 August 2026.**

---

## 0. Corrections to the briefs

Verification turned up two factual problems in brief v1. Both are recorded here because
the site would have shipped them.

### C-01 · The Kitchen date is wrong in v1

Brief v1 §1.3 dates the coining of "Frippertronics" to **May 1977**, at the Kitchen, NYC.

**Tamm gives February 1978**, verbatim:

> "On Sunday, February 5, 1978, Fripp made his first official solo appearance in over
> three years, at the Kitchen in Soho: this was also the first time he used the name
> 'Frippertronics'."

Tamm separately dates the start of Fripp's *own work* with the system to **June 1977**
in New York, which may be where the 1977 date came from — but that is the practice
beginning, not the naming.

**Resolution:** the lineage table uses **5 February 1978** for the naming and **June
1977** for the practice, both attributed to Tamm. A third source should be found before
launch, since Tamm is currently sole authority.
**Affects:** chapter 2 lineage table; the Part I timeline.

### C-02 · The *Sacred Songs* release year is unstable

v1 §1.5 gives "rec. 1977, rel. 1980". Tamm says the album "eventually came out in
**1979**". The commonly cited release is **March 1980**.

**Resolution:** use "recorded late 1977, released 1980", and do not cite Tamm for the
release year. Tamm remains the source for the *first recorded use* claim only.
**Affects:** chapter 5, the four modes.

### C-03 · The Loopers Delight page is not dead

Both briefs flag it as probably dead. **It is live**, at a path different from the one
usually cited. See §3.

---

## 1. Primary — Fripp's own words

| Source | Status | Notes |
|---|---|---|
| **Interview with Robert Fripp by Dick Tooley**, Winnipeg, 9 Aug 1979 — [Elephant Talk wiki](https://www.elephant-talk.com/wiki/Interview_with_Robert_Fripp_by_Dick_Tooley) | ✅ live, full text confirmed | The richest single document. Contains the active-listener doctrine verbatim. |
| **Ron Gaskin interview**, Toronto, ~12 Aug 1979 — [Elephant Talk wiki](https://www.elephant-talk.com/wiki/August_1979_interview_with_Robert_Fripp) | ✅ **located 11 Aug 2026** — full text (~7,500 words) | The clearest mechanical description Fripp ever gave: "I record on the left machine … the signal passes along the tape to the right machine where it's played back to the left machine and recorded a second time." Provenance caveat: a 1996 fan transcription (Jim Price) of an unnamed Toronto tabloid — cite as *"unnamed Toronto music tabloid, August 1979; transcribed by Jim Price, Elephant Talk, 17 July 1996."* Wayback-mirrored (200s from 2007 through 2026); citable snapshot 17 Feb 2025. |
| **Fripp & Belew interview by Kenneth Fall**, Boston, 28 Oct 1981 — [Elephant Talk wiki](https://www.elephant-talk.com/wiki/October_1981_interview_with_Adrian_Belew_and_Robert_Fripp) | ✅ **located 11 Aug 2026** — full text | Primary, independent confirmation of the *Discipline* cycles, in Fripp's own words: "the rhythm section is in seventeen, and the front line are in fifteen. And it varies a bit along the way." His own hedge is quotable as such. Feeds chapter 8 and Q-03. |
| **Robert Fripp's Substack** — [robertfripp.substack.com](https://robertfripp.substack.com) | ✅ live | Fripp@80 writings; Dublin keynote notes, serialising since 16 May 2026. **Ongoing — re-check before launch.** |
| **DGM Live — Frippertronics** — [dgmlive.com](https://dgmlive.com/index.php/robert-fripp/frippertronics) | ✅ live | |
| **Guitar Craft aphorisms + Fripp's usage terms** — [partitasmusic.com/aphorisms](https://partitasmusic.com/aphorisms) | ✅ live | **Read the usage terms before quoting anything.** Governs [D-030](../decisions/030-no-aphorism-database.md). |
| **Guitar Craft publications** — [guitarcraft.com/publications](https://guitarcraft.com/publications/) | ✅ live | |
| **Fripp, *The Guitar Circle*** (Panegyric/DGM, 1 Sept 2022), 554pp, ISBN 9781916153011 | 🛒 **purchase required** | The authorised text on the teaching. Chapters 8–10 lean on it. See §6. |
| **The Midnight Special**, taped 5 Oct 1979 | ⚠️ locate | The only footage of him explaining the rig on camera. ~4 min. Natural "watch this first". |
| **Alexander Technique Congress keynote**, Dublin, 4 Aug 2025 — seven YouTube parts | ✅ **transcribed 15 Aug 2026** | Caption tracks appeared post-launch; all seven video IDs collected, auto-captions pulled via yt-dlp to `references/files/raw/dublin-keynote-2025/part-N.txt`. **Auto-generated: verification-grade only, never quote them verbatim.** Source of the counting/clapping exercise. See the keynote section below. |
| **Dublin keynote notes** — seven Substack posts, serialised 16 May – 27 Jun 2026, starting at [I · Coming into the Space](https://robertfripp.substack.com/p/i-coming-into-the-space) | ✅ **saved 15 Aug 2026** | Fripp's own written version of the keynote — **the citable text** (`dublin-keynote-notes` in the manifest). Quote from these; verify against the videos. |

### Verified quotations

Short quotations, verified against source, for use in the site with attribution.

**Listening vs. hearing** — Tooley interview, 1979:
> "A person who listens exerts an act of attention. A person who hears is a passive
> listener, if you like. A passive hearer. It's the difference between being a human
> being and being a vegetable."

**Tamm, verified against the archived full text, 11 Aug 2026** — three passages that
gate chapters 2 and 5:

> "it was during June of that year [1977] that what Fripp has called his 'own work' with
> the tape-loop-delay system, or Frippertronics, began."

> "On Sunday, February 5, 1978, Fripp made his first official solo appearance in over
> three years, at the Kitchen in Soho: this was also the first time he used the name
> 'Frippertronics' for his tape-delay system." *(Confirms C-01; also identifies the
> Joanna Walton connection — the Kitchen event was originally planned as a private
> performance in Walton's apartment.)*

> "At the time of its making, Sacred Songs represented the first recorded use of
> Frippertronics" *(— the claim that rests on Tamm alone and must always be attributed
> to him, per content-methodology §2.)*

Bonus, for chapter 7: Tamm reports Fripp "finding therein an expression of Gurdjieff's
'Law of Seven,' which in turn is reflected in music's diatonic scale" — a second
reporting leg beside Robertson.

**The mechanism, in Fripp's own words** — Gaskin interview, Aug 1979, verified verbatim
11 Aug 2026 against the Wayback snapshot (17 Feb 2025) of the Elephant Talk page:
> "I record on the left machine, the guitar is recorded on the left machine, the signal
> passes along the tape to the right machine where it's played back to the left machine
> and recorded a second time."

And, asked when the sound is released into the room:
> "Oh, straightaway. Unless, what I could do if I wanted to be crafty, would be to build
> up a chord which no one could hear and then turn the chord on."

The second passage is grammar lesson 3 avant la lettre. Note: the interview never uses
the word *loop* — the not-strictly-a-loop point rests on the sleeve diagram's topology
(the take-up reel), not on a Fripp quotation.

**The E minor / G minor collision** — Tooley interview, 1979, verified verbatim
11 Aug 2026 (context: applied Frippertronics on *Sacred Songs*, over a drum break in a
Daryl Hall composition):
> "There was one exquisite moment, exquisite moment where a Frippertronics loop in E
> minor and a Frippertronics loop in G minor collided beautifully. An exquisite
> interstice."

Chapter 3.2's central sourced item — and the word *interstice* again.

**On Eno's demonstration** — Tooley interview, 1979:
> "He didn't tell me how it worked. I simply intuited what was happening, and that was
> side one of No Pussyfooting."

**The definition** — Fripp, 1980, quoted in Tamm:
> "that musical experience resulting at the interstice of Robert Fripp and a small,
> mobile and appropriate level of technology, vis. his guitar, Frippelboard [effects
> pedal board] and two Revoxes [reel-to-reel tape recorders]."

Note this fuller version names the components. The briefs quote a truncated form.

**Discotronics** — *Under Heavy Manners* liner notes, quoted in Tamm:
> "Discotronics is defined as that musical experience resulting at the interstice of
> Frippertronics and disco."

The repeated word *interstice* across both definitions is not coincidence and is worth
a sentence in chapter 5.

### The Dublin keynote, transcribed and verified — 15 Aug 2026

Robert Fripp, keynote to the Alexander Technique Congress, Dublin, 4 August 2025.
Seven YouTube parts, IDs collected 15 Aug 2026 from the embeds in Fripp's per-part
Substack notes:

| Part | Title | YouTube ID |
|---|---|---|
| I | Coming into the Space | `8RY0MAfyl4k` |
| II | Coming into the Room | `Qr9wfY4VBCY` |
| III | Attention | `CfA5JgUCW7U` |
| IV | Coming into Ourselves | `X4BKxUStpV8` |
| V | Coming into the Event | `hkDLkZk6B2U` |
| VI | Coming into the Process | `p_g_Qagru38` |
| VII | Shall We Change the World? | `9JwLQ2PQT5Q` |

**Method and rights posture.** Two texts exist. (1) Auto-generated English captions
(asr), pulled via `yt-dlp --skip-download --write-auto-subs` on 15 Aug 2026 and
flattened to `references/files/raw/dublin-keynote-2025/part-N.txt` — transcription
noise throughout ("hyparxis" comes out "hypoxis"), so these are **verification-grade
only and never quoted verbatim**. (2) Fripp's own written notes, one Substack post per
part, serialised 16 May – 27 Jun 2026 and saved to
`.../notes-N.html` — his own hand, and **the only text the site quotes**
(`dublin-keynote-notes`). Every passage below is from the notes, checked against the
matching video's captions for fidelity to what was said on the day. The two diverge
only in polish, never in substance.

**The counting exercise** — notes to Part IV, verified against the video (the
demonstration is at ~3:33–6:00 of `X4BKxUStpV8`). This is the source of the Cycles
engine's `claps` preset, and the clap pattern the preset states is confirmed exactly —
five on 1 and 4, seven on 1, 4 and 6:

> "A question: does anyone here have a problem counting to five? While we are counting
> to five, we'll clap our hands on 1 and 4. A question: does anyone have a problem
> counting to seven? While counting to seven, we'll clap our hands on 1, 4 and 6."

**The exercise's name and purpose** — notes to Part IV (quoted in chapter 8):

> "This simple exercise of playing in two groups, one in 5 and the other in 7, is
> called THRAKKING in Guitar Craft. It was initially introduced as an exercise of
> health and vigour, and a binding exercise to bring together participants on Guitar
> Craft courses."

The video adds detail the notes omit: the exercise binds "anywhere between 12 and 107,
110 people who haven't worked together before", a third group can beat eleven "on one,
four, seven, and a number of your choice", and a soloist "would have to give five to
the left hand and seven to the right" — paraphrase only, captions.

**The attention doctrine** — notes to Part III (quoted in Part IV, The Room). The 2025
restatement of the 1979 Tooley listening-vs-hearing distinction, which until now
rested on the single 1979 source:

> "There are three qualities of attention: active, passive, and none whatsoever."

> "Where our attention is, is where we are. The quality of our attention is all we
> properly have in life."

> "The good news: active attention may be practised. In Guitar Craft, we practice the
> Division of Attention."

**The process framing** — notes to Part VI (quoted in chapter 7). Fifty years after
Sherborne, the triadic parsing and Bennett-school vocabulary are still the working
grammar; *hyparxis* is spelled thus in Fripp's own text:

> "Any process has three stages: the beginning, the middle and the end. Each of these
> three stages also has three stages, giving nine distinct qualitative points."

> "There are three qualities of time at work in a process: sequential clock time,
> eternity and hyparxis, or Creative Time."

**Also verified, not currently quoted:** the three prime characteristics of liminality
— "ambiguity, hazard and opportunity" (Part I — the word *hazard* again, in Fripp's
own taxonomy); the six principles of the performance event, with the seventh residing
in silence (Part V); "There is a law – light drives out the dark" via the
Rev. Peter Dewey, 1974 (Part VII).

---

## 2. Scholarly

| Source | Status | Notes |
|---|---|---|
| **Eric Tamm, *Robert Fripp: From Crimson King to Crafty Master*** (1990) — [Internet Archive, full text, opensource](https://archive.org/details/robert-fripp-from-king-crimson-to-guitar-craft_202103) | ✅ **obtained, full text** | Chapter 8 covers Frippertronics. Downloadable as PDF/EPUB/txt, unrestricted. Published under the title *From King Crimson to Guitar Craft*; the free e-book edition Tamm released uses *From Crimson King to Crafty Master*. |
| **David G. Robertson, "Tuning Ourselves"**, *Religion and the Arts* 21(1–2), 2017, 236–258. DOI [10.1163/15685292-02101010](https://doi.org/10.1163/15685292-02101010). Open access: [oro.open.ac.uk/68544](https://oro.open.ac.uk/68544) | ⚠️ **403 to automated fetch; open access in a browser** | The only peer-reviewed work on the Gurdjieff link. Chapter 7 depends on it. Not dead — ORO blocks bots. |

**Tamm, verified verbatim — the claim chapter 5 rests on:**
> "At the time of its making, Sacred Songs represented the first recorded use of
> Frippertronics"

Tamm is **sole authority** for this. The site must attribute it to him explicitly rather
than stating it as settled fact.

**Tamm, on the touring rationale:**
> "he proposed the 'small, mobile intelligent unit' — a phrase which became the Frippism
> par excellence of the late 1970s"

Tamm dates the Frippertronics world tour to **April–August 1979**.

> ⚠️ **Do not commit Tamm's full text to this repository.** It is a copyrighted book made
> freely available by its author; short quotations with attribution are fine, wholesale
> reproduction is not.

---

## 3. History and mechanism

| Source | Status | Notes |
|---|---|---|
| **Signs & Symptoms**, Harold Schellinx — [part 1](https://www.harsmedia.com/Amphibious/Projects/sigsym.html) · [part 2](https://www.harsmedia.com/Amphibious/Projects/sigsym2.html) | ✅ live, **part 2 verified** | The best surviving description of actually operating one. **Part 2 carries the operational detail** — part 1 is background only. |
| **Loopers Delight — Frippertronics**, by Andre LaFosse — [loopers-delight.com/tools/frippertronics/frippertronics.html](http://www.loopers-delight.com/tools/frippertronics/frippertronics.html) | ✅ **live** | ⚠️ Both briefs assume this is dead. It is not. The commonly cited paths `/history/Frippert.html` and `/tools/fripp/fripp.html` **404**; this is the working URL. |
| **Loopers Delight — The Birth of Loop**, Michael Peters — [/history/Loophist.html](http://www.loopers-delight.com/history/Loophist.html) | ✅ live | Essay on looping history. |
| **Wikipedia — Frippertronics** | ✅ live | Orientation only; not citable for claims. |
| **Wikipedia — *Discreet Music*** | ✅ live | For the record; the **diagram must come from the physical sleeve**. |

**Signs & Symptoms part 2, verified verbatim** — the operational account, on Akai
reel-to-reels rather than Revoxes:

> "It then was a matter of simultaneously releasing the two 'pause' handles in order to
> get both recorders running at the same moment."

> "It was possible to monitor what was going on and synchronize the actual playing with
> the fed back signal, through the first machine's line output, or it's headphone output."

> each player could "determine the relative level of the feedback to that of his actual
> playing by fiddling around with the input dials of his channel."

---

### Chapter-2 lineage sources — added and verified 11 Aug 2026

| Source | Supports |
|---|---|
| **Scorranese, "Digital Morphophone Environment"**, DAFx25 2025 — [pdf](https://dafx.de/paper-archive/2025/DAFx25_paper_70.pdf) | Morphophone **1953** (not 1951 — the earlier assumption was wrong), Poullin with Moles; one record head, ten movable playback heads on a rotating wheel. 120years.net says c.1955; print "1953" or hedge "early 1950s". |
| **Buffalo AKG, Conrad retrospective object labels** — [pdf](https://buffaloakg.org/sites/default/files/tony_conrad_wall_text_and_object_labels.pdf) | *Three Loops for Performers and Tape Recorders*, score dated 8–21 Nov 1961. |
| **Schellinx, Sign & Symptoms |1|** — [harsmedia.com](https://www.harsmedia.com/Amphibious/Projects/sigsym.html) | Quotes Conrad's score appendix ("two tape recorders are used, arranged so that one plays what has been recorded some interval of time previously by the other"); and verbatim: "it doesn't make a lot of sense to point out some one … as the 'originator(s)' of the idea … it's pretty much something that came along with the machine." |
| **IRCAM B.R.A.H.M.S., Riley work-course** (Noubel) — [ressources.ircam.fr](https://ressources.ircam.fr/en/composer/terry-riley/workcourse) | Time Lag Accumulator, Paris 1963, *Music for The Gift*; note it dates *Mescalin Mix* to **1961**, so do not attach it to the 1963 node. |
| **Oliveros, "What Matters? Make the Music!"**, eContact! 17.3 — [econtact.ca](https://econtact.ca/17_3/oliveros_music.html) | First-person: the reel run across two machines; the four-channel two-machine system of *I of IV* (1966). |

The 1972 Eno demonstration and the 1977–78 solo timeline rest on **Tamm** (verified
passages in §1). The Walton-coined-the-name credit circulates via Wikipedia only
(citing *Product* 2016, unverified) — **not printable yet**; Tamm supports the Kitchen
event being planned with Joanna Walton and the name's first use there.

## 4. Method and modern practice

| Source | Status | Notes |
|---|---|---|
| **Norman Lamont, How I play Frippertronics** — [part 1](https://normanlamont.com/how-i-play-frippertronics/) · [part 2](https://normanlamont.com/how-to-play-frippertronics-2/) | ✅ live, verified | **The only decent published method found.** Converts directly into the grammar lessons. |
| ambientguitar.net — Frippertronics | ✅ live | |
| Line 6 blog — Jeff Schroeder on Frippertronics presets | to re-check | |
| Red Panda Tensor Frippertronics mod | to re-check | Out of the box its overdub mode is a plain looper; needs a MIDI setting change. |
| Mod Wiggler — delay pedals for Frippertronics | to re-check | |
| **Max 7 delay tutorial 3** — `Long_loop` | to re-check | `tapin~`/`tapout~` + feedback gain; docs explicitly frame it as the two-tape-machine technique. |
| Patchstorage — Frippertronics / sound-on-sound | to re-check | |

**Tamm on the tour and the hazard** — verified against the archived full text,
11 Aug 2026 (Part IV's spine; resolves the "proposition of hazard" source gap):
> [Fripp, via Garbarini 1979:] "What I should personally like to do is to add the random
> factor, the factor of hazard … to walk on stage unexpectedly during one of his
> performances and having become familiar with the tonal center, improvise over the top
> of it."

> "he proposed the 'small, mobile intelligent unit' — a phrase which became the Frippism
> par excellence of the late 1970s"

> [Venues of the 1979 tour:] "small clubs, restaurants, art galleries, record shops,
> radio station studios, museums, record company offices, and even the occasional pizza
> parlor" — with the tour's motto "human contact" (Jones 1979A, via Tamm).

*(No planetarium in Tamm — the planetarium detail in the page spec has no source yet
and stays out of Part IV until one surfaces.)*

**Lamont's minimum kit** — part 1, verified verbatim 11 Aug 2026:
> "any electric guitar, distortion FX, volume pedal, long, decaying delay"

**Tamm on the retreat and Bennett** — verified against the archived full text,
11 Aug 2026 (chapter 7's spine):
> "Between September 1974 and August 1977, Fripp retreated from the music industry for
> three years … withdrawal (attending a ten-month course at J.G. Bennett's Academy for
> the Harmonious Development of Man at Sherborne)"

> [First contact, 1974:] "The proverbial straw was reading the text of a lecture by
> J.G. Bennett the night before the Red recording sessions were to begin … This was the
> first time Fripp had come into contact with the teaching of Bennett, who had been a
> disciple of the infamous George Gurdjieff"

> [Brussels, via Fripp's Musician column:] "finding therein an expression of
> Gurdjieff's 'Law of Seven,' which in turn is reflected in music's diatonic scale"

> [The League of Gentlemen:] "A seven-day recording session produced only two pieces,
> 'Heptaparaparshinokh' and 'Dislocated.'"

*(Tamm does not mention "Marriagemuzic" — the single-pairing fact still needs a
release-level source before chapter 7 can print it.)*

**Lamont's sequence plan** — part 1, "Structured pieces", verified verbatim 11 Aug 2026
(chapter 4's capstone; note it is in part 1, not part 2 as first assumed):
> "Set up organ drone in D / Sprinkle some high glockenspiel notes randomly in the loop /
> Guitar improv in Dm / When organ drone has faded change chord to A or Em, let it
> cycle / Return organ drone to D / Guitar improv in D major but fed into looper so very
> few notes"

**Lamont on mud** — part 2, verified verbatim 11 Aug 2026:
> "Over and over I've seen friends try the equipment and very quickly create the sonic
> equivalent of mud – a thick and unappealing mess."
> "Too many notes in the same octave tend to sound muddy."

**Lamont, verified verbatim** — the grammar the S-size lesson implements:

> note 1: "this becomes the root note of the key of the piece"
> note 2: "often either the fifth, or the third"
> note 3: something "less obvious – a higher octave, a second or a major seventh"

> "Sometimes I just don't play – I sit and listen to the three looping notes until I have
> an idea what I feel like adding."

> "Adding too much to the loop at this point creates the sonic equivalent of mud, and
> it's all going round all the time, so there's not much to get a purchase on as a
> listener."

Minimum kit, verbatim: *"any electric guitar, distortion FX, volume pedal, long,
decaying delay"*.

---

## 5. Rhythm, the interlock, and the tuning

| Source | Status | Notes |
|---|---|---|
| **Bruford and the Beat** (1982) — [YouTube, full](https://www.youtube.com/watch?v=7BiYQt5cLgU) | ✅ **live** | Bruford explains the 17/16 including the 4/4 bass-drum groove underneath; interleaved with a Fripp interview. **The Discipline mime segments are muted for copyright; the explanatory content is intact**, which is the part we need. Filmed NYC/New Haven, Feb–Mar 1982. DVD also exists (Discogs r10885200); `billbruford.com/bruford-beat-dvd/` **404s**. |
| *Discipline* meter sequence — [thissideofsanity.com](https://www.thissideofsanity.com/music/songs/di/discipline.php) | ✅ live | ⚠️ **Wikipedia-derived** (the page credits Wikipedia CC-BY-SA; `ags.earth` carries identical text; the current Wikipedia article has dropped the passage). Counts as ONE source, and a tertiary one. The independent legs are now the Fall 1981 interview (17 and 15, Fripp verbatim — §1), *Bruford and the Beat* and DRUM! (17). **The 14 remains single-tradition and stays hedged** — see Q-03's resolution. |
| **"10 Ways To Sound Like Bill Bruford"**, John Natelli, DRUM! Magazine, 22 Nov 2012 — [drummagazine.com](https://drummagazine.com/10-ways-to-sound-like-bill-bruford/) | ✅ **located 11 Aug 2026** | Independent drummer's-eye description of the *Discipline* groove: "17 sixteenth-notes — which would make the time signature 17/16 — tethered to quarter-notes on the bass drum," from a left-handed Swiss triplet. Second independent leg for the 17. |
| TV Tropes — *Discipline* | ⚠️ 403 to bots | Uncitable anyway; useful only as a checklist of which tracks pair which meters. |
| Recreating the interlock with a looper — [7dmedia.com](https://7dmedia.com/news/blog/7536236/) | ✅ live | Explicit contrast with Reich. Supports the drift/offset distinction. |
| Wikipedia — New standard tuning | ✅ live | Intervals, regular-tuning properties. |
| **Rāga Junglism — New Standard** — [ragajunglism.org/tunings/menu/new-standard/](https://ragajunglism.org/tunings/menu/new-standard/) | ✅ live | Source of Steve Ball's "long stilts" observation. |
| Stringjoy — NST explained | ✅ live | Fripp's account that the tuning "flew by" in a sauna, Sept 1983; adopted 1985. |
| Wikipedia — Guitar Craft | ✅ live | |
| **Michigan Daily**, 14 June 1979, p. 7 — "Second Chance rips out", Keith Tosolt | ✅ **re-verified against the archived snapshot** | Cloudflare still defeats automated fetch of the live page, but the Wayback snapshot of 12 Dec 2025 (`web.archive.org/web/20251212190629/…mdp.39015071754555/519`) embeds the OCR text layer. All passages below re-read against it 15 Aug 2026 — verbatim matches. The site's in-page paraphrase was tightened the same day ("as the loop thickened" overstated; the source says "repeat for short periods"). Manual download for `references/files/` remains open but no longer gates verification. |

### Michigan Daily, 14 June 1979 — verified verbatim

The claim brief v2 §1.2 rests on for spectral-rather-than-chordal thinking, now
confirmed against the source:

> "Fripp hit a lot of har-monic overtones — sending these high frequency sounds through
> the tape loop and allowing them to repeat for short periods — then varied the tonal
> field."

Two further passages the briefs did not flag, both useful:

**The live format**, corroborating the build-then-solo account in v1 §1.4:
> "Live 'Frippertronics' is developed in two stages: an initial improvisation and an
> overdubbed secondary improvisation. Fripp sets down a variety of echoes in rhythm and
> then plays the tape back, adding more guitar lines and effects over, under and in
> between the original sounds."

**On stereo** — which bears directly on the mono decision (Q-05), and argues for it:
> "attempting to achieve a stereo perspective that is not split radically between left
> and right channels but diffused into one blended aural texture."

Fripp was deliberately working *against* hard left/right separation. That is a reason to
keep the Rig mono beyond mere historical convenience.

Also usable in Part IV: Fripp described the concert's aim as a **"demystifying
experience"**, a reordering of preconceived notions about the rock star and the rock
concert.

**Meter sequence as published** (Belew first, Fripp second) — *use only with the
caveat that it rests on one source*:

> 5/8 & 5/8 → 5/8 & 4/4 → 5/8 & 9/8 → 15/16 & 15/16 → 15/16 & 14/16 → 10/8 & 20/16 →
> 15/16 & 15/16 → 15/16 & 14/16 → 12/16 & 12/16 → 12/16 & 11/16 → 15/16 & 15/16 →
> 15/16 & 14/16, with drums in 17/16 throughout.

Elsewhere on the record: "Frame by Frame" 7/8 against 6/8; "Thela Hun Ginjeet" 7/8 guitar
against 4/4 band; "Indiscipline" 15/8 guitar over 4/4 drums.

---

## 6. Gurdjieff and Bennett

| Source | Status |
|---|---|
| Robertson 2017 — see §2 | ⚠️ 403 to bots, open access in browser |
| [Gurdjieff Club — Principles of Work](https://gurdjieffclub.com/en/princzipy-raboty/) (Law of Seven, Law of Three, enneagram) | ✅ live |
| Endless Search — Law of Seven / Heptaparaparshinokh | to re-check |
| Wikipedia — John G. Bennett | ✅ live |

Per [D-034](../decisions/034-cite-robertson-not-gurdjieff.md),
cite Robertson's summaries in preference to Gurdjieff directly.

---

## 7. Rig and gear

Fripperies (frippgear.wordpress.com) · Premier Guitar Rig Rundown · MusicRadar rig tour ·
Sylvian Vista, *Bringing Down the Light* (2290-era detail) · Reverb, "sounding like
Robert Fripp". **All to re-verify** in the next pass; none carries a load-bearing claim.

---

## 8. Technical references

For the engineering documents rather than the prose.

| Source | Used by |
|---|---|
| **Chris Wilson, "A Tale of Two Clocks"** — [web.dev/articles/audio-scheduling](https://web.dev/articles/audio-scheduling) | [Audio engine §7](audio-engine.md), [Cycles engine](cycles-engine.md). The canonical lookahead-scheduling reference; MDN recommends it directly. |
| MDN — Web Audio API: advanced techniques | [Audio engine](audio-engine.md) |
| **Vitest — coverage config** — [vitest.dev/config/coverage](https://vitest.dev/config/coverage) | [Testing strategy](testing-strategy.md). Source of the `all: true` requirement and threshold semantics. |
| **Gatsby — How Gatsby works with GitHub Pages** — [gatsbyjs.com](https://www.gatsbyjs.com/docs/how-to/previews-deploys-hosting/how-gatsby-works-with-github-pages/) | [CI/CD](ci-cd.md). Source of the `pathPrefix` rule in [D-029](../decisions/029-github-pages-pathprefix.md). |
| **Bun — package manager docs** — [bun.com/docs/pm/cli/install](https://bun.com/docs/pm/cli/install) | [Tech stack](tech-stack.md). `trustedDependencies` and lifecycle-script behaviour. |
| `standardized-audio-context-mock` — [npm](https://www.npmjs.com/package/standardized-audio-context-mock) | [Testing strategy](testing-strategy.md). jsdom does not implement Web Audio; this is the mocking option. |
| WCAG 2.2 — 1.4.2 Audio Control, 2.3.3 Animation from Interactions | [Accessibility](accessibility-and-interaction.md) |
| Quiver — browser integration guide (in-repo: `docs/src/how-to/browser-integration.md`) | [Audio engine §5](audio-engine.md) |

---

## 9. Purchase paths

Per client instruction: dig first, buy as a last resort. These are the items where no
free legitimate access was found.

| Item | Path | Approx. | Blocks |
|---|---|---|---|
| **Fripp, *The Guitar Circle*** (2022) | [DGM Live](https://dgmlive.com/products/the-guitar-circle) (preferred — direct to rights holder) · Burning Shed (UK) · Inner Knot (US) · [Amazon](https://www.amazon.com/The-Guitar-Circle/dp/1916153011) · ISBN 9781916153011 | book | Chapters 8, 9, 10 |
| **Bruford and the Beat** DVD | Discogs release r10885200 — **only if the YouTube copy proves insufficient**, which it likely will not, since only the muted segments are lost | DVD | Chapter 8 |
| **Uncut** covermount CD, Frippertronics compiled by Fripp | Back issues / marketplace | magazine | Part V running order (nice-to-have, not blocking) |

**Everything else on the Tier 1 list was obtained free and legitimately.** Tamm is fully
in hand; Robertson is open access; Bruford is on YouTube.

---

## 10. Still open

| Gap | What is needed |
|---|---|
| ~~***Discreet Music* liner diagram**~~ | **Resolved 11 Aug 2026 — visually confirmed** as the sleeve artwork (US Obscure/EG jacket per the JEM Records line): [Are.na block 4229499](https://www.are.na/block/4229499), 3360×1890, fully legible. The site's redrawn descendant lives in `DiscreetSchematic`. Original candidates for the record: an Are.na block titled "Brian Eno, Operational diagram for Discreet Music, 1975" ([are.na/block/4229499](https://www.are.na/block/4229499), 3360×1890 — diagram-shaped crop, by far the most legible find, but unsourced so must be visually confirmed against the sleeve), and the Discogs OBS 3 first-pressing gallery ([release 187339](https://www.discogs.com/release/187339), five ~600px images, needs a logged-in browser). See Q-02. |
| ~~**Ron Gaskin interview**, 1979~~ | **Resolved 11 Aug 2026** — full text located; now in §1 with its provenance caveat. |
| ~~**Dublin keynote 2025**~~ | **Resolved 15 Aug 2026** — caption tracks appeared post-launch; all seven IDs collected, captions pulled (verification-grade), and Fripp's own Substack notes saved as the citable text. Verbatim passages now in §1; chapters 7, 8 and Part IV each carry a keynote-sourced passage. |
| **Guitar Craft Monograph No. 3** (1987 poster) | An image, for reference only — **not reproduction** ([D-030](../decisions/030-no-aphorism-database.md)). Source of the harmonic-series statement used in chapter 3.2. |
| ~~**A third source for the *Discipline* meters**~~ | **Substantially resolved 11 Aug 2026** — Fall 1981 (Fripp: 17 and 15, verbatim) and DRUM! 2012 (17) are independent; the 14 stays hedged. Details in §1, §5 and Q-03. |
| **A second source for the Kitchen date** | Tamm is currently sole authority — see [C-01](#c-01--the-kitchen-date-is-wrong-in-v1). |

---

## Citation format on the site

Every factual claim links to its entry here. Format:

> Claim. <sup>[†](/sources#tamm-1990)</sup>

Editorial claims — ours, not sourced — carry the mark from
[D-003](../decisions/003-editorial-claims-marked.md)
instead of a citation, and must never carry a footnote that implies a source.
