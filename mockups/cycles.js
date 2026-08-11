/* ============================================================
   Two Machines — the Cycles engine (prototype)

   The second engine. Where Tape models one cycle running against
   your phrase, this models N cycles running against each other.
   Same split as engine.js: Cycles.math is pure number-in/number-out
   and touches no AudioContext, so it ports to TypeScript verbatim
   and carries the tests. Everything below it is wiring.

   Two modes, and the distinction is the whole point:

     OFFSET — one shared pulse, different integer cycle lengths.
              Finite orbit. Exact return at the LCM.
              (the clapping exercise; the Discipline interlock)

     DRIFT  — different tempos. Continuous phase sweep.
              No exact return, ever.
              (Reich's Piano Phase; a delay at an arbitrary setting)

   These sound alike and are not the same object. Most looping
   literature conflates them.
   ============================================================ */

(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     PURE MATH
     ---------------------------------------------------------- */

  function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      var t = a % b;
      a = b;
      b = t;
    }
    return a;
  }

  function lcm(a, b) {
    if (!a || !b) return 0;
    return Math.abs((a / gcd(a, b)) * b);
  }

  function lcmAll(xs) {
    if (!xs.length) return 0;
    return xs.reduce(function (acc, x) {
      return lcm(acc, x);
    });
  }

  /* Does this voice sound on this pulse? Negative beats wrap correctly,
     which matters because the ribbon draws a little before zero. */
  function isHit(voice, beat) {
    var p = ((beat % voice.cycle) + voice.cycle) % voice.cycle;
    return voice.hits.indexOf(p) >= 0;
  }

  /* Pulses on which every listed voice sounds together. This is the
     realignment, and it is the payoff in every exercise on the site. */
  function coincidences(voices, span) {
    var out = [];
    if (!voices.length) return out;
    for (var i = 0; i < span; i++) {
      var all = true;
      for (var v = 0; v < voices.length; v++) {
        if (!isHit(voices[v], i)) {
          all = false;
          break;
        }
      }
      if (all) out.push(i);
    }
    return out;
  }

  /* CONVENTION, and it matters because two pages quote this number.

     longestGap is the INTERVAL from one coincidence to the next — for
     five against seven that is 18, the distance from beat 11 to beat 29.

     longestInterlock is the count of beats BETWEEN them, on which nothing
     agrees — 17. That is the musically meaningful figure (it is how long
     you are on your own) and it is what the five-against-seven page
     already prints, so it is what the UI shows. Keep both: the interval
     is the one you want for arithmetic, the count is the one you say
     out loud. */
  function longestInterlock(voices, span) {
    var gap = longestGap(voices, span);
    return Math.max(0, gap - 1);
  }

  function longestGap(voices, span) {
    var c = coincidences(voices, span);
    if (c.length === 0) return span;
    if (c.length === 1) return span;
    var max = 0;
    for (var i = 1; i < c.length; i++) max = Math.max(max, c[i] - c[i - 1]);
    return Math.max(max, c[0] + span - c[c.length - 1]);
  }

  /* Fraction of pulses on which anything at all sounds. Past about 0.7
     the ear stops hearing an interlock and starts hearing a texture. */
  function density(voices, span) {
    if (!span) return 0;
    var n = 0;
    for (var i = 0; i < span; i++) {
      for (var v = 0; v < voices.length; v++) {
        if (isHit(voices[v], i)) {
          n++;
          break;
        }
      }
    }
    return n / span;
  }

  function hitCount(voice, span) {
    var n = 0;
    for (var i = 0; i < span; i++) if (isHit(voice, i)) n++;
    return n;
  }

  /* The exact return, in pulses. Infinity is impossible in offset mode —
     that is precisely what separates it from drift. */
  function returnPulses(voices) {
    return lcmAll(
      voices.map(function (v) {
        return v.cycle;
      })
    );
  }

  function pulsesToSeconds(pulses, bpm) {
    return (pulses * 60) / bpm;
  }

  /* Drift mode. Two voices at rates rA and rB never realign unless the
     ratio is rational; what you can state is how long until they are one
     full cycle apart, which is the audible "wave". */
  function driftBeatSeconds(cycle, bpm, rateA, rateB) {
    var d = Math.abs(rateA - rateB);
    if (d < 1e-9) return Infinity;
    return (cycle * 60) / (bpm * d);
  }

  /* Phase of a voice at time t, as 0..1 of its own cycle. */
  function phaseAt(voice, t, bpm) {
    var spb = 60 / (bpm * (voice.rate == null ? 1 : voice.rate));
    return ((t / spb) % voice.cycle) / voice.cycle;
  }

  var math = {
    gcd: gcd,
    lcm: lcm,
    lcmAll: lcmAll,
    isHit: isHit,
    coincidences: coincidences,
    longestGap: longestGap,
    longestInterlock: longestInterlock,
    density: density,
    hitCount: hitCount,
    returnPulses: returnPulses,
    pulsesToSeconds: pulsesToSeconds,
    driftBeatSeconds: driftBeatSeconds,
    phaseAt: phaseAt,
  };

  /* ----------------------------------------------------------
     PERCUSSION
     Deliberately generic. The rights position on the Discipline
     material is that we model meters and never reproduce parts,
     so these are unpitched-ish strikes distinguished by register
     alone — enough to tell voices apart, not enough to be a line.
     ---------------------------------------------------------- */

  function createKit(ctx, dest) {
    var out = dest || ctx.destination;

    var len = Math.floor(ctx.sampleRate * 0.3);
    var noise = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = noise.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    function strike(t, opts) {
      var o = opts || {};
      var freq = o.freq == null ? 900 : o.freq;
      var decay = o.decay == null ? 0.11 : o.decay;
      var level = o.level == null ? 0.34 : o.level;
      var tone = o.tone == null ? 0.5 : o.tone; /* 0 = wood, 1 = noise */

      var g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(level, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      g.connect(out);

      if (tone < 1) {
        var osc = ctx.createOscillator();
        var og = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.72, t + decay);
        og.gain.value = 1 - tone;
        osc.connect(og).connect(g);
        osc.start(t);
        osc.stop(t + decay + 0.05);
      }
      if (tone > 0) {
        var src = ctx.createBufferSource();
        var bp = ctx.createBiquadFilter();
        var ng = ctx.createGain();
        src.buffer = noise;
        bp.type = 'bandpass';
        bp.frequency.value = freq * 1.6;
        bp.Q.value = 1.1;
        ng.gain.value = tone * 0.8;
        src.connect(bp).connect(ng).connect(g);
        src.start(t);
        src.stop(t + 0.3);
      }
    }

    return { strike: strike, out: out };
  }

  /* ----------------------------------------------------------
     TRANSPORT
     Lookahead scheduling: a timer runs ahead of the clock and books
     events on the audio thread, while a queue feeds the paint loop
     at the moment each event is actually heard. setInterval alone is
     far too jittery to hear five against seven honestly.
     ---------------------------------------------------------- */

  function createTransport(ctx, opts) {
    var o = opts || {};
    var LOOKAHEAD = 0.12;
    var TICK = 25;

    var state = {
      bpm: o.bpm || 84,
      voices: o.voices || [],
      playing: false,
      t0: 0,
      pulse: false /* sound the bare pulse under everything */,
    };

    var queue = [];
    var timer = null;
    var onFire = o.onFire || function () {};

    function spbFor(v) {
      return 60 / (state.bpm * (v && v.rate != null ? v.rate : 1));
    }

    function reset() {
      state.t0 = ctx.currentTime + 0.08;
      queue.length = 0;
      state.voices.forEach(function (v) {
        v._nextBeat = 0;
        v._nextTime = state.t0;
      });
      state._pulseBeat = 0;
      state._pulseTime = state.t0;
    }

    function schedule() {
      var horizon = ctx.currentTime + LOOKAHEAD;

      if (state.pulse) {
        while (state._pulseTime < horizon) {
          onFire(null, state._pulseBeat, state._pulseTime);
          state._pulseTime += 60 / state.bpm;
          state._pulseBeat += 1;
        }
      }

      state.voices.forEach(function (v, vi) {
        if (v._nextTime == null) {
          v._nextBeat = 0;
          v._nextTime = state.t0;
        }
        var spb = spbFor(v);
        while (v._nextTime < horizon) {
          var hit = isHit(v, v._nextBeat);
          if (hit && !v.muted) onFire(vi, v._nextBeat, v._nextTime);
          if (hit) queue.push({ voice: vi, beat: v._nextBeat, t: v._nextTime });
          v._nextTime += spb;
          v._nextBeat += 1;
        }
      });
    }

    var api = {
      state: state,

      start: function () {
        if (state.playing) return api;
        reset();
        state.playing = true;
        timer = global.setInterval(schedule, TICK);
        schedule();
        return api;
      },

      stop: function () {
        state.playing = false;
        global.clearInterval(timer);
        queue.length = 0;
        return api;
      },

      setBpm: function (b) {
        /* Retime in place rather than restarting, so a tempo change mid
           exercise does not throw away where you are in the cycle. */
        state.bpm = b;
        return api;
      },

      setVoices: function (vs) {
        state.voices = vs;
        if (state.playing) reset();
        return api;
      },

      /* Elapsed pulses at the reference rate — the global playhead the
         ribbon and grid views both draw against. */
      pulseNow: function () {
        if (!state.playing) return 0;
        return (ctx.currentTime - state.t0) / (60 / state.bpm);
      },

      /* Paint events whose audio has actually reached the speakers. */
      drain: function () {
        var out = [];
        while (queue.length && queue[0].t <= ctx.currentTime + 0.012) {
          out.push(queue.shift());
        }
        return out;
      },
    };

    return api;
  }

  /* ----------------------------------------------------------
     PRESETS

     RIGHTS: meters only. No King Crimson part is reproduced here —
     each Discipline-derived preset carries the cycle length and the
     downbeat, which is public analytical fact, and nothing else.
     The hit patterns are yours to build in the editor.
     ---------------------------------------------------------- */

  var PRESETS = [
    {
      id: 'claps',
      name: 'Five against seven',
      mode: 'offset',
      bpm: 84,
      unit: 'beats',
      note: 'The Dublin counting exercise. Count five, clap on 1 and 4; count seven, clap on 1, 4 and 6.',
      source: 'Alexander Technique Congress keynote, Dublin, 4 August 2025',
      voices: [
        { name: 'Five', cycle: 5, hits: [0, 3], freq: 1950, tone: 0.85 },
        { name: 'Seven', cycle: 7, hits: [0, 3, 5], freq: 780, tone: 0.85 },
      ],
    },
    {
      id: 'discipline',
      name: 'Discipline · 15 : 14 : 17',
      mode: 'offset',
      bpm: 264,
      unit: 'sixteenths',
      note: 'Two guitars a sixteenth apart in cycle length, over a drum cycle of seventeen. The generative device is one player taking the other’s phrase and cutting the last note.',
      source: 'King Crimson, "Discipline", 1981 — meters only',
      voices: [
        { name: 'Guitar one · 15/16', cycle: 15, hits: [0], freq: 1400, tone: 0.3 },
        { name: 'Guitar two · 14/16', cycle: 14, hits: [0], freq: 1050, tone: 0.3 },
        { name: 'Drums · 17/16', cycle: 17, hits: [0], freq: 620, tone: 0.55 },
      ],
    },
    {
      id: 'frame',
      name: 'Frame by Frame · 7 : 6',
      mode: 'offset',
      bpm: 190,
      unit: 'eighths',
      note: 'A seven against a six. The shortest orbit of the set — they are back together every forty-two.',
      source: 'King Crimson, "Frame by Frame", 1981 — meters only',
      voices: [
        { name: 'Seven', cycle: 7, hits: [0], freq: 1400, tone: 0.3 },
        { name: 'Six', cycle: 6, hits: [0], freq: 1050, tone: 0.3 },
      ],
    },
    {
      id: 'thela',
      name: 'Thela Hun Ginjeet · 7 : 8',
      mode: 'offset',
      bpm: 200,
      unit: 'eighths',
      note: 'A guitar in seven against a band in common time. Off by exactly one, which is the cleanest possible case.',
      source: 'King Crimson, "Thela Hun Ginjeet", 1981 — meters only',
      voices: [
        { name: 'Guitar · 7/8', cycle: 7, hits: [0], freq: 1400, tone: 0.3 },
        { name: 'Band · 4/4', cycle: 8, hits: [0, 4], freq: 700, tone: 0.5 },
      ],
    },
    {
      id: 'indiscipline',
      name: 'Indiscipline · 15 : 8',
      mode: 'offset',
      bpm: 210,
      unit: 'eighths',
      note: 'A fifteen-eight guitar line over a four-four drum pattern.',
      source: 'King Crimson, "Indiscipline", 1981 — meters only',
      voices: [
        { name: 'Guitar · 15/8', cycle: 15, hits: [0], freq: 1400, tone: 0.3 },
        { name: 'Drums · 4/4', cycle: 8, hits: [0, 4], freq: 700, tone: 0.5 },
      ],
    },
    {
      id: 'drift',
      name: 'Drift · the same cycle, two tempos',
      mode: 'drift',
      bpm: 132,
      unit: 'beats',
      note: 'Identical patterns, one running four per cent fast. Nothing is off by an integer here, so there is no return — only a slow sweep through every phase relationship.',
      source: 'The Reich case, and what a delay does at an arbitrary setting',
      voices: [
        { name: 'At tempo', cycle: 8, hits: [0, 3, 6], freq: 1400, tone: 0.4, rate: 1 },
        { name: 'Four per cent fast', cycle: 8, hits: [0, 3, 6], freq: 900, tone: 0.4, rate: 1.04 },
      ],
    },
  ];

  global.Cycles = {
    math: math,
    createKit: createKit,
    createTransport: createTransport,
    PRESETS: PRESETS,
  };
})(typeof window !== 'undefined' ? window : globalThis);
