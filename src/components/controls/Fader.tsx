// Fader (design-system §6): label, tabular value, optional unity mark.
// Built on a range input so keyboard operation and the accessible name come
// from the platform, not from re-implementation.

import * as React from 'react'

export interface FaderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Mark unity on the scale — the line the feedback fader must show
   * (Audio engine §3: "unity marked at 1.0; above is runaway"). */
  unityAt?: number
  /** Format the readout. Defaults to two decimals (content-methodology §5). */
  format?: (value: number) => string
  onChange: (value: number) => void
}

export const Fader: React.FC<FaderProps> = ({
  label,
  value,
  min,
  max,
  step = 0.01,
  unityAt,
  format = (v) => v.toFixed(2),
  onChange,
}) => {
  const pastUnity = unityAt !== undefined && value > unityAt
  return (
    <label data-fader data-past-unity={pastUnity || undefined}>
      <span>{label}</span>
      <span data-readout>{format(value)}</span>
      <span data-fader-track>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          aria-label={label}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {unityAt !== undefined && unityAt >= min && unityAt <= max && (
          <span
            aria-hidden="true"
            data-unity-mark
            style={{ left: `${((unityAt - min) / (max - min)) * 100}%` }}
          />
        )}
      </span>
    </label>
  )
}
