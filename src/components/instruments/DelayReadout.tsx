// The XS: an inline, read-only delay-time readout for chapter 1
// (docs/chapters/01-what-it-is.md). It reflects the Rig's persisted state —
// the number printed is the same number the Rig on / is using — and it is
// emphatically not a control: no chrome, no sound, nothing settable. Q-11
// keeps the whole XS rung on probation; this is its one test case.
//
// XS budget (design-system §4): 0 controls, no chrome, lives inside a
// sentence. Seconds to two decimals, tabular (content-methodology §5).

import * as React from 'react'
import { decodeRigState, RIG_STATE_STORAGE_KEY } from '../../audio/rig/urlState'

export const DelayReadout: React.FC = () => {
  // Server render and first client render use the default rig (hydration-safe);
  // the stored state is applied in the mount effect.
  const [seconds, setSeconds] = React.useState(decodeRigState('').distanceSeconds)

  React.useEffect(() => {
    const read = (): void => {
      try {
        const raw = window.localStorage.getItem(RIG_STATE_STORAGE_KEY) ?? ''
        // Same codec as the URL: storage is untrusted input, sanitized on read.
        setSeconds(decodeRigState(raw).distanceSeconds)
      } catch {
        // Storage unavailable (private mode): the default stands.
      }
    }
    read()
    window.addEventListener('storage', read)
    return () => window.removeEventListener('storage', read)
  }, [])

  return (
    <span data-instrument="delay-readout" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {seconds.toFixed(2)}&nbsp;s
    </span>
  )
}
