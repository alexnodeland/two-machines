// The sound bar (ADR-047 §3): the site-wide guarantee that the reader always
// knows what is sounding and can always make it stop. Fixed to the bottom of
// every page; states are the arbiter's, not the component's. Renders
// identically on the server (silent, volume 1) — hydration-safe by
// construction.

import * as React from 'react'
import {
  getArbiterState,
  killAllSound,
  setMasterVolume,
  subscribeArbiter,
} from '../../audio/arbiter'

export const SoundBar: React.FC = () => {
  const [state, setState] = React.useState(getArbiterState)
  React.useEffect(() => subscribeArbiter(setState), [])

  return (
    <div
      data-soundbar
      data-sounding={state.sounding !== null}
      role="group"
      aria-label="Sound"
    >
      <span data-soundbar-status aria-live="polite">
        {state.sounding ? `Sounding — ${state.sounding}` : 'Silent'}
      </span>
      <label data-soundbar-volume>
        <span>Volume</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={state.volume}
          aria-label="Master volume"
          onChange={(e) => setMasterVolume(Number(e.target.value))}
        />
      </label>
      <button
        type="button"
        data-soundbar-kill
        onClick={killAllSound}
        aria-label="Silence everything"
      >
        Silence
      </button>
    </div>
  )
}
