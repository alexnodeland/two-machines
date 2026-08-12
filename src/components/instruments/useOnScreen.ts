// Off-screen pause (Plan-001 Phase 6, performance): canvas paint loops skip
// their work while the instrument is scrolled out of view. Only PAINTING
// pauses — audio scheduling, measurement and transport never gate on
// visibility, because sound keeps playing while you scroll (that is the
// point of a loop).
//
// Returned as a ref, not state: the frame loops read it every tick without
// re-rendering, and environments without IntersectionObserver (jsdom, old
// browsers) simply never pause.

import * as React from 'react'

export const useOnScreen = (
  ref: React.RefObject<Element | null>
): React.RefObject<boolean> => {
  const visibleRef = React.useRef(true)
  React.useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver((entries) => {
      visibleRef.current = entries[0]?.isIntersecting ?? true
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, []) // mount-only by design: the ref identity is stable
  return visibleRef
}
