// The spine's single input (design-system §5, D-022): one CSS custom
// property, --spine-heat (0–1), set from the audio layer, plus a root flag
// for past-unity. The spine itself is pure CSS over these two values — no
// component subscribes to audio state, so there is exactly one page-level
// effect and it costs one style write per change.

export const SPINE_RUNAWAY_ATTR = 'data-spine-runaway'

/** Publish the running instrument's feedback level. Idle instruments call
 * with 0 on teardown so the spine falls back to its floor. */
export const setSpineHeat = (feedback: number): void => {
  /* c8 ignore next -- SSR guard, unreachable under jsdom */
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const heat = Math.max(0, Math.min(1, feedback))
  root.style.setProperty('--spine-heat', heat.toFixed(3))
  if (feedback > 1) {
    root.setAttribute(SPINE_RUNAWAY_ATTR, 'true')
  } else {
    root.removeAttribute(SPINE_RUNAWAY_ATTR)
  }
}
