// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { encodeRigState, RIG_STATE_STORAGE_KEY } from '../../audio/rig/urlState'
import { defaultParams } from '../../audio/rig/params'
import { DelayReadout } from './DelayReadout'

// This jsdom build ships without localStorage; a Map-backed stand-in is
// enough, since the component treats storage as untrusted text anyway.
const store = new Map<string, string>()
Object.defineProperty(window, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => store.set(k, String(v)),
    removeItem: (k: string) => store.delete(k),
    clear: () => store.clear(),
  },
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

const text = (): string =>
  // The component prints a non-breaking space; normalize for plain literals.
  (
    document.querySelector('[data-instrument="delay-readout"]')?.textContent ?? ''
  ).replace(/\u00A0/g, ' ')

describe('DelayReadout', () => {
  it('prints the default machine distance when the rig was never touched', () => {
    render(<DelayReadout />)
    expect(text()).toBe('4.20 s')
  })

  it('reflects the persisted rig state to two decimals', () => {
    window.localStorage.setItem(
      RIG_STATE_STORAGE_KEY,
      encodeRigState({ ...defaultParams(), distanceSeconds: 6.5 })
    )
    render(<DelayReadout />)
    expect(text()).toBe('6.50 s')
  })

  it('sanitizes hand-edited storage instead of trusting it', () => {
    window.localStorage.setItem(RIG_STATE_STORAGE_KEY, 'd=999&fb=evil')
    render(<DelayReadout />)
    expect(text()).toBe('8.00 s') // clamped to the contract's ceiling
  })

  it('follows the rig live across tabs via the storage event', () => {
    render(<DelayReadout />)
    expect(text()).toBe('4.20 s')
    window.localStorage.setItem(
      RIG_STATE_STORAGE_KEY,
      encodeRigState({ ...defaultParams(), distanceSeconds: 3.25 })
    )
    act(() => window.dispatchEvent(new Event('storage')))
    expect(text()).toBe('3.25 s')
  })

  it('keeps the default when storage throws (private mode)', () => {
    const spy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    render(<DelayReadout />)
    expect(text()).toBe('4.20 s')
    spy.mockRestore()
  })

  it('is read-only: renders no button, input, or other control', () => {
    render(<DelayReadout />)
    expect(document.querySelectorAll('button, input, select, a').length).toBe(0)
  })
})
