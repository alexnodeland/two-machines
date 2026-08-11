/* ============================================================
   Two Machines — tape-delay engine (prototype)

   Plain script, no modules, so every mockup opens straight off
   the filesystem with no dev server. Exposes window.Tape.

   Deliberate structure: Tape.curves holds ONLY pure functions of
   numbers. Nothing in it touches an AudioContext. That half ports
   to TypeScript verbatim and is trivially covered by Vitest; the
   node-graph half gets a mocked AudioContext. Keeping the seam
   here is why 100% coverage is achievable rather than aspirational.
   ============================================================ */

(function (global) {
  'use strict';

  /* ----------------------------------------------------------
     PURE CURVES
     ---------------------------------------------------------- */

  /* Tape speeds in cm/s. 7½ ips is the classic Revox setting and
     the one the delay-time-as-distance readout assumes. */
  var SPEEDS = {
    '3.75': 9.525,
    '7.5': 19.05,
    '15': 38.1,
  };

  var curves = {
    SPEEDS: SPEEDS,

    /* The whole conceit of the hero: delay time is not a parameter,
       it is a distance you can walk across. */
    distanceToSeconds: function (cm, speed) {
      var cps = SPEEDS[speed] || SPEEDS['7.5'];
      return cm / cps;
    },

    secondsToDistance: function (s, speed) {
      var cps = SPEEDS[speed] || SPEEDS['7.5'];
      return s * cps;
    },

    /* How many audible repeats before the signal falls under -60 dB.
       Infinity at or past unity — that IS the runaway condition. */
    repeatsToInaudible: function (feedback) {
      if (feedback <= 0) return 0;
      if (feedback >= 1) return Infinity;
      return Math.log(0.001) / Math.log(feedback);
    },

    /* Seconds until the loop is inaudible, at a given machine spacing. */
    decayTime: function (feedback, delaySeconds) {
      var n = curves.repeatsToInaudible(feedback);
      return n === Infinity ? Infinity : n * delaySeconds;
    },

    /* Tape age 0..1 → lowpass cutoff. Each pass through an aged
       machine eats the top; this is why a long decay browns out
       rather than just fading. */
    ageToCutoff: function (age) {
      var a = clamp(age, 0, 1);
      return 16000 * Math.pow(0.055, a); // 16 kHz fresh → ~880 Hz worn
    },

    ageToWow: function (age) {
      return clamp(age, 0, 1) * 0.0022; // seconds of pitch wobble
    },

    ageToHiss: function (age) {
      return clamp(age, 0, 1) * 0.0075;
    },

    dbToGain: function (db) {
      return Math.pow(10, db / 20);
    },

    gainToDb: function (g) {
      return g <= 0 ? -Infinity : 20 * Math.log10(g);
    },

    /* Equal-tempered pitch from A440. */
    midiToFreq: function (m) {
      return 440 * Math.pow(2, (m - 69) / 12);
    },

    /* Peak level 0..1 → how many segments of a 12-segment VU are lit,
       with the ballistics weighted so the top of the scale is tight. */
    vuSegments: function (level, count) {
      var n = count || 12;
      var db = curves.gainToDb(clamp(level, 0, 2));
      if (db < -48) return 0;
      return Math.min(n, Math.round(((db + 48) / 54) * n));
    },

    /* Feedback → a plain-language verdict. Drives the one bit of
       coaching the rig gives you. */
    feedbackState: function (feedback) {
      if (feedback < 0.35) return 'sparse';
      if (feedback < 0.72) return 'decaying';
      if (feedback < 0.93) return 'accumulating';
      if (feedback < 1.0) return 'near unity';
      return 'runaway';
    },

    clamp: clamp,
  };

  function clamp(v, lo, hi) {
    return v < lo ? lo : v > hi ? hi : v;
  }

  /* ----------------------------------------------------------
     THE RIG — one AudioContext, ever.
     ---------------------------------------------------------- */

  var _ctx = null;

  function context() {
    if (!_ctx) {
      var Ctor = global.AudioContext || global.webkitAudioContext;
      _ctx = new Ctor();
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  /* A gentle tanh saturator on the feedback path. This is doing real
     work, not flavour: it is what lets feedback sit at or past unity
     and turn to mud instead of to digital clipping. Tape compresses;
     a bare gain node does not. */
  function saturationCurve(amount) {
    var n = 1024;
    var curve = new Float32Array(n);
    var k = amount || 2.2;
    for (var i = 0; i < n; i++) {
      var x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    return curve;
  }

  function noiseBuffer(ctx, seconds) {
    var len = Math.floor(ctx.sampleRate * (seconds || 2));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    var last = 0;
    for (var i = 0; i < len; i++) {
      /* one-pole lowpassed white → tape hiss rather than TV static */
      var w = Math.random() * 2 - 1;
      last = 0.82 * last + 0.18 * w;
      d[i] = last * 3.2;
    }
    return buf;
  }

  /*  SIGNAL PATH — this is the Discreet Music schematic, in nodes.

      input ─┬─ recordHead ──────────────┐            (machine one records)
             │                           ▼
             └─ monitor ──────┐        [ delay ]      (the span of tape)
                              │          │
                              │          ▼
                              │      lowpass → highpass → saturate
                              │          │        (machine two plays back
                              │          ├──── feedback ──┐   through worn heads)
                              │          │                │
                              │          ▼                └──► back into delay
                              └───────► master ◄── loopOut

      Two independent taps to the room — `monitor` (what the room hears
      of you playing now) and `loopOut` (what the room hears of the tape).
      That split IS Fripp's two volume pedals, and it's the reason he can
      solo audibly without committing a note to the loop.
  */
  function createRig(opts) {
    var o = opts || {};
    var ctx = context();

    var input = ctx.createGain();
    var recordHead = ctx.createGain();
    var monitor = ctx.createGain();
    var delay = ctx.createDelay(12);
    var lp = ctx.createBiquadFilter();
    var hp = ctx.createBiquadFilter();
    var sat = ctx.createWaveShaper();
    var feedback = ctx.createGain();
    var loopOut = ctx.createGain();
    var master = ctx.createGain();
    var analyser = ctx.createAnalyser();

    lp.type = 'lowpass';
    lp.Q.value = 0.4;
    hp.type = 'highpass';
    hp.frequency.value = 85; /* stops the loop building unplayable rumble */
    hp.Q.value = 0.5;
    sat.curve = saturationCurve(2.2);
    sat.oversample = '2x';

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.55;

    input.gain.value = 1;
    recordHead.gain.value = o.recordHead == null ? 0.85 : o.recordHead;
    monitor.gain.value = o.monitor == null ? 0.85 : o.monitor;
    feedback.gain.value = o.feedback == null ? 0.75 : o.feedback;
    loopOut.gain.value = o.loopOut == null ? 0.95 : o.loopOut;
    master.gain.value = o.master == null ? 0.9 : o.master;
    delay.delayTime.value = o.delaySeconds == null ? 3.2 : o.delaySeconds;

    input.connect(recordHead);
    input.connect(monitor);
    recordHead.connect(delay);
    delay.connect(lp);
    lp.connect(hp);
    hp.connect(sat);
    sat.connect(feedback);
    feedback.connect(delay); /* ← the feedback path. the entire idea. */
    sat.connect(loopOut);
    monitor.connect(master);
    loopOut.connect(master);
    master.connect(analyser);
    analyser.connect(ctx.destination);

    /* wow & flutter: a slow and a fast wobble summed onto delayTime */
    var wowOsc = ctx.createOscillator();
    var flutOsc = ctx.createOscillator();
    var wowDepth = ctx.createGain();
    var flutDepth = ctx.createGain();
    wowOsc.frequency.value = 0.47;
    flutOsc.frequency.value = 6.3;
    wowDepth.gain.value = 0;
    flutDepth.gain.value = 0;
    wowOsc.connect(wowDepth).connect(delay.delayTime);
    flutOsc.connect(flutDepth).connect(delay.delayTime);
    wowOsc.start();
    flutOsc.start();

    /* hiss, injected into the loop so it accumulates with the music */
    var hissSrc = ctx.createBufferSource();
    var hissGain = ctx.createGain();
    hissSrc.buffer = noiseBuffer(ctx, 2);
    hissSrc.loop = true;
    hissGain.gain.value = 0;
    hissSrc.connect(hissGain).connect(delay);
    hissSrc.start();

    var state = {
      delaySeconds: delay.delayTime.value,
      feedback: feedback.gain.value,
      recordHead: recordHead.gain.value,
      monitor: monitor.gain.value,
      age: 0.35,
      speed: '7.5',
    };

    var peakBuf = new Float32Array(analyser.fftSize);

    var rig = {
      ctx: ctx,
      input: input,
      master: master,
      analyser: analyser,
      state: state,

      /* Ramped, not stepped. A stepped delayTime clicks; a ramped one
         glides in pitch exactly the way sliding a real deck along the
         bench does. The artifact is the honest behaviour, so keep it. */
      setDelaySeconds: function (s, glide) {
        state.delaySeconds = clamp(s, 0.05, 11);
        delay.delayTime.setTargetAtTime(
          state.delaySeconds,
          ctx.currentTime,
          glide == null ? 0.09 : glide
        );
        return rig;
      },

      setDistance: function (cm, glide) {
        return rig.setDelaySeconds(curves.distanceToSeconds(cm, state.speed), glide);
      },

      setSpeed: function (speed) {
        state.speed = speed;
        return rig;
      },

      setFeedback: function (v) {
        state.feedback = clamp(v, 0, 1.18);
        feedback.gain.setTargetAtTime(state.feedback, ctx.currentTime, 0.03);
        return rig;
      },

      setRecordHead: function (v) {
        state.recordHead = clamp(v, 0, 1.4);
        recordHead.gain.setTargetAtTime(state.recordHead, ctx.currentTime, 0.02);
        return rig;
      },

      setMonitor: function (v) {
        state.monitor = clamp(v, 0, 1.4);
        monitor.gain.setTargetAtTime(state.monitor, ctx.currentTime, 0.02);
        return rig;
      },

      setLoopOut: function (v) {
        loopOut.gain.setTargetAtTime(clamp(v, 0, 1.4), ctx.currentTime, 0.02);
        return rig;
      },

      setAge: function (a) {
        state.age = clamp(a, 0, 1);
        lp.frequency.setTargetAtTime(curves.ageToCutoff(state.age), ctx.currentTime, 0.05);
        wowDepth.gain.value = curves.ageToWow(state.age);
        flutDepth.gain.value = curves.ageToWow(state.age) * 0.28;
        hissGain.gain.setTargetAtTime(curves.ageToHiss(state.age), ctx.currentTime, 0.2);
        return rig;
      },

      setMaster: function (v) {
        master.gain.setTargetAtTime(clamp(v, 0, 1.2), ctx.currentTime, 0.02);
        return rig;
      },

      /* Wipe the tape without tearing the speakers: drop feedback to
         zero, let the span run out, then restore. */
      wipe: function () {
        var held = state.feedback;
        feedback.gain.cancelScheduledValues(ctx.currentTime);
        feedback.gain.setTargetAtTime(0, ctx.currentTime, 0.06);
        global.setTimeout(function () {
          rig.setFeedback(held);
        }, 420);
        return rig;
      },

      peak: function () {
        analyser.getFloatTimeDomainData(peakBuf);
        var p = 0;
        for (var i = 0; i < peakBuf.length; i++) {
          var a = peakBuf[i] < 0 ? -peakBuf[i] : peakBuf[i];
          if (a > p) p = a;
        }
        return p;
      },

      /* --------- sources --------- */

      /* A struck note. Two detuned saws through a swept lowpass —
         close enough to a clean guitar into a Roland JC-120 for the
         grammar lessons to teach the right thing. */
      pluck: function (freq, opts2) {
        var p = opts2 || {};
        var t = ctx.currentTime + (p.at || 0);
        var dur = p.dur == null ? 1.6 : p.dur;
        var level = p.level == null ? 0.34 : p.level;
        var attack = p.attack == null ? 0.006 : p.attack;

        var a = ctx.createOscillator();
        var b = ctx.createOscillator();
        var f = ctx.createBiquadFilter();
        var g = ctx.createGain();
        a.type = 'sawtooth';
        b.type = 'sawtooth';
        a.frequency.value = freq;
        b.frequency.value = freq * 1.0016;
        f.type = 'lowpass';
        f.Q.value = 1.6;
        f.frequency.setValueAtTime(Math.min(freq * 9, 7200), t);
        f.frequency.exponentialRampToValueAtTime(Math.max(freq * 2.2, 220), t + dur * 0.8);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(level, t + attack);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        a.connect(f);
        b.connect(f);
        f.connect(g);
        g.connect(input);
        a.start(t);
        b.start(t);
        a.stop(t + dur + 0.05);
        b.stop(t + dur + 0.05);
        return { freq: freq, at: t };
      },

      /* A held note, for droning and for volume swells. `attack` long
         enough and you get the bowed, pickless entry Fripp uses to
         slide a note into the loop without a transient. */
      sustain: function (freq, opts2) {
        var p = opts2 || {};
        var t = ctx.currentTime;
        var level = p.level == null ? 0.26 : p.level;
        var attack = p.attack == null ? 0.05 : p.attack;

        var a = ctx.createOscillator();
        var b = ctx.createOscillator();
        var f = ctx.createBiquadFilter();
        var g = ctx.createGain();
        a.type = 'sawtooth';
        b.type = 'sawtooth';
        a.frequency.value = freq;
        b.frequency.value = freq * 1.0019;
        f.type = 'lowpass';
        f.Q.value = 1.1;
        f.frequency.value = Math.min(freq * 6.5, 5200);

        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(level, t + attack);

        a.connect(f);
        b.connect(f);
        f.connect(g);
        g.connect(input);
        a.start(t);
        b.start(t);

        var released = false;
        return {
          freq: freq,
          release: function (tail) {
            if (released) return;
            released = true;
            var rt = tail == null ? 0.22 : tail;
            var now = ctx.currentTime;
            g.gain.cancelScheduledValues(now);
            g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + rt);
            a.stop(now + rt + 0.05);
            b.stop(now + rt + 0.05);
          },
        };
      },

      /* Microphone, if granted. The site must be fully usable without
         it — everything above is the fallback instrument. */
      openMic: function () {
        if (!global.navigator || !global.navigator.mediaDevices) {
          return Promise.reject(new Error('no mediaDevices'));
        }
        return global.navigator.mediaDevices
          .getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
          })
          .then(function (stream) {
            var src = ctx.createMediaStreamSource(stream);
            src.connect(input);
            return {
              stream: stream,
              close: function () {
                src.disconnect();
                stream.getTracks().forEach(function (t) {
                  t.stop();
                });
              },
            };
          });
      },

      dispose: function () {
        try {
          wowOsc.stop();
          flutOsc.stop();
          hissSrc.stop();
        } catch (e) {
          /* already stopped */
        }
        master.disconnect();
      },
    };

    rig.setAge(state.age);
    return rig;
  }

  global.Tape = {
    curves: curves,
    context: context,
    createRig: createRig,
    saturationCurve: saturationCurve,
    noiseBuffer: noiseBuffer,
  };
})(typeof window !== 'undefined' ? window : globalThis);
