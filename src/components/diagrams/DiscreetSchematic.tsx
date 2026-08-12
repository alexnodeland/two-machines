// The hero schematic: an honest descendant of the operational diagram on the
// Discreet Music sleeve (Obscure, 1975), drawn from the actual artwork —
// visually confirmed 11 Aug 2026 (Q-02) — not reconstructed from memory.
// Same relationships, our geometry: source chain into the record machine, the
// delay line as the physical span of tape, the delay return closing the
// signal loop, the take-up spiral where the output is stored (the tape
// itself never returns), and the combined monitor output to the room.
// Colour is semantic (ADR-020): record side brass, playback side aqua.
// Inline SVG with a real text alternative (content-methodology §6).

import * as React from 'react'

const box: React.CSSProperties = {
  fill: 'none',
  strokeWidth: 2,
}

const label: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  fill: 'var(--ivory)',
}

const small: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  fill: 'var(--ivory-dim)',
}

export const DiscreetSchematic: React.FC = () => (
  <figure data-diagram="discreet-schematic" style={{ margin: '2rem 0' }}>
    <svg
      viewBox="0 0 880 300"
      role="img"
      aria-labelledby="discreet-schematic-title discreet-schematic-desc"
      style={{ width: '100%', height: 'auto' }}
    >
      <title id="discreet-schematic-title">The Discreet Music signal path, redrawn</title>
      <desc id="discreet-schematic-desc">
        A source feeds a graphic equalizer, then an echo unit, then the record head of
        machine one. The tape travels as a physical span — the delay line — from machine
        one to machine two, where it is played back. The playback returns electrically to
        machine one and is recorded again, while the tape itself winds onward onto machine
        two&apos;s take-up reel: the output is stored, and the tape never returns. A
        combined monitor output carries everything to the room.
      </desc>

      {/* source chain */}
      <rect
        x="10"
        y="110"
        width="110"
        height="60"
        style={{ ...box, stroke: 'var(--ivory-dim)' }}
      />
      <text x="65" y="136" textAnchor="middle" style={label}>
        source
      </text>
      <text x="65" y="154" textAnchor="middle" style={small}>
        pad · guitar
      </text>

      <rect
        x="160"
        y="110"
        width="110"
        height="60"
        style={{ ...box, stroke: 'var(--ivory-dim)' }}
      />
      <text x="215" y="136" textAnchor="middle" style={label}>
        equalizer
      </text>

      <rect
        x="310"
        y="110"
        width="110"
        height="60"
        style={{ ...box, stroke: 'var(--ivory-dim)' }}
      />
      <text x="365" y="136" textAnchor="middle" style={label}>
        echo unit
      </text>

      {/* machine one: record (brass) */}
      <rect
        x="470"
        y="90"
        width="140"
        height="100"
        style={{ ...box, stroke: 'var(--brass)' }}
      />
      <text
        x="540"
        y="130"
        textAnchor="middle"
        style={{ ...label, fill: 'var(--brass)' }}
      >
        machine one
      </text>
      <text x="540" y="150" textAnchor="middle" style={small}>
        record
      </text>

      {/* machine two: playback (aqua) */}
      <rect
        x="700"
        y="90"
        width="140"
        height="100"
        style={{ ...box, stroke: 'var(--aqua)' }}
      />
      <text x="770" y="130" textAnchor="middle" style={{ ...label, fill: 'var(--aqua)' }}>
        machine two
      </text>
      <text x="770" y="150" textAnchor="middle" style={small}>
        playback
      </text>

      {/* the tape span: the delay line */}
      <line
        x1="610"
        y1="170"
        x2="700"
        y2="170"
        stroke="var(--ivory-ghost)"
        strokeWidth="8"
      />
      <text x="655" y="196" textAnchor="middle" style={small}>
        the delay line — a span of tape
      </text>

      {/* take-up spiral: output stored, tape never returns */}
      <path
        d="M 852 76 a 12 12 0 1 1 -24 0 a 18 18 0 1 1 36 0 a 24 24 0 1 1 -48 0"
        fill="none"
        stroke="var(--aqua)"
        strokeWidth="2"
      />
      <text x="840" y="34" textAnchor="middle" style={small}>
        output stored on the take-up reel
      </text>

      {/* signal path */}
      <g stroke="var(--ivory)" strokeWidth="2.5" fill="none">
        <path d="M 120 140 L 154 140" markerEnd="url(#arrow)" />
        <path d="M 270 140 L 304 140" markerEnd="url(#arrow)" />
        <path d="M 420 140 L 464 140" markerEnd="url(#arrow)" />
        {/* record → playback along the tape */}
        <path d="M 610 155 L 694 155" markerEnd="url(#arrow)" />
        {/* delay return: playback back into record */}
        <path d="M 770 90 L 770 48 L 540 48 L 540 84" markerEnd="url(#arrow)" />
        {/* onward to the take-up reel */}
        <path d="M 826 90 L 826 84" markerEnd="url(#arrow)" />
        {/* combined monitor output */}
        <path d="M 600 190 L 600 250 L 630 250" markerEnd="url(#arrow)" />
      </g>
      <text x="640" y="254" style={small}>
        combined monitor output — the room
      </text>
      <text x="655" y="42" textAnchor="middle" style={small}>
        delay return
      </text>

      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--ivory)" />
        </marker>
      </defs>
    </svg>
    <figcaption style={{ ...small, fontSize: '0.8rem' }}>
      After the operational diagram on the <em>Discreet Music</em> sleeve (Obscure, 1975).
      Same relationships, our drawing.
    </figcaption>
  </figure>
)
