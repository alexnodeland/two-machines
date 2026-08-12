// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { cleanup, render } from '@testing-library/react'
import { useOnScreen } from './useOnScreen'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

const Probe: React.FC<{ report: (ref: React.RefObject<boolean>) => void }> = ({
  report,
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const visible = useOnScreen(ref)
  report(visible)
  return <div ref={ref} />
}

describe('useOnScreen', () => {
  it('defaults to visible where IntersectionObserver does not exist (jsdom)', () => {
    let visible: React.RefObject<boolean> | null = null
    render(<Probe report={(r) => (visible = r)} />)
    expect((visible as unknown as React.RefObject<boolean>).current).toBe(true)
  })

  it('follows the observer when one exists, and disconnects on unmount', () => {
    let callback: (entries: { isIntersecting: boolean }[]) => void = () => {}
    const observe = vi.fn()
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
          callback = cb
        }
        observe = observe
        disconnect = disconnect
      }
    )
    let visible: React.RefObject<boolean> | null = null
    const view = render(<Probe report={(r) => (visible = r)} />)
    const ref = visible as unknown as React.RefObject<boolean>
    expect(observe).toHaveBeenCalledTimes(1)
    callback([{ isIntersecting: false }])
    expect(ref.current).toBe(false) // scrolled away: paint loops skip
    callback([{ isIntersecting: true }])
    expect(ref.current).toBe(true)
    callback([]) // a malformed batch fails open, never stuck-hidden
    expect(ref.current).toBe(true)
    view.unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
