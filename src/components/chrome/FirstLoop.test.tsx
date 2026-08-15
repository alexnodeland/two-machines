// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { claimVoice, resetArbiterForTests, type Voice } from '../../audio/arbiter'
import {
  FIRST_LOOP_DISMISSED_KEY,
  FIRST_LOOP_DONE_KEY,
  resetFirstLoopForTests,
} from './firstLoopSteps'
import { FirstLoop } from './FirstLoop'

vi.mock('gatsby', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}))

// This jsdom ships no localStorage (the component's try/catch covers that in
// production); the persistence tests need a real-enough one.
const store = new Map<string, string>()
const fakeStorage = {
  getItem: (key: string): string | null => store.get(key) ?? null,
  setItem: (key: string, value: string): void => void store.set(key, value),
  removeItem: (key: string): void => void store.delete(key),
  clear: (): void => store.clear(),
}

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: fakeStorage,
  })
})

afterEach(() => {
  cleanup()
  resetArbiterForTests()
  resetFirstLoopForTests()
  store.clear()
  vi.restoreAllMocks()
})

const voice = (label: string): Voice => ({ label, silence: () => {}, dispose: () => {} })

const stepItems = (): HTMLElement[] =>
  Array.from(document.querySelectorAll('[data-first-loop-steps] > li'))

describe('FirstLoop', () => {
  it('renders the server state: card visible, every step open, no payoff', () => {
    render(<FirstLoop query={null} />)
    expect(screen.getByLabelText('Your first loop')).toBeTruthy()
    const items = stepItems()
    expect(items).toHaveLength(3)
    for (const item of items) {
      expect(item.getAttribute('data-step-done')).toBe('false')
    }
    expect(screen.queryByText(/Now stop playing/)).toBeNull()
  })

  it('a deep-linked arrival sets the baseline instead of completing step 1', () => {
    const { rerender } = render(<FirstLoop query={null} />)
    rerender(<FirstLoop query="preset=mud" />)
    expect(stepItems()[0]?.getAttribute('data-step-done')).toBe('false')
    // Leaving the deep link's distance is the reader's own move.
    rerender(<FirstLoop query="preset=mud&d=5" />)
    expect(stepItems()[0]?.getAttribute('data-step-done')).toBe('true')
  })

  it('checks step 1 off when the distance leaves its arrival value, and stays checked', () => {
    const { rerender } = render(<FirstLoop query="" />)
    rerender(<FirstLoop query="d=3.5" />)
    expect(stepItems()[0]?.getAttribute('data-step-done')).toBe('true')
    expect(stepItems()[0]?.textContent).toContain('done')
    rerender(<FirstLoop query="" />)
    expect(stepItems()[0]?.getAttribute('data-step-done')).toBe('true')
  })

  it('checks step 2 off when the arbiter hears the Rig — and ignores other voices', () => {
    render(<FirstLoop query="" />)
    act(() => claimVoice(voice('The Cycles engine')))
    expect(stepItems()[1]?.getAttribute('data-step-done')).toBe('false')
    act(() => claimVoice(voice('The Rig')))
    expect(stepItems()[1]?.getAttribute('data-step-done')).toBe('true')
  })

  it('hears the Rig even before the arrival query is read', () => {
    render(<FirstLoop query={null} />)
    act(() => claimVoice(voice('The Rig')))
    expect(stepItems()[1]?.getAttribute('data-step-done')).toBe('true')
  })

  it('sees a Rig that was already sounding at mount', () => {
    claimVoice(voice('The Rig'))
    render(<FirstLoop query="" />)
    expect(stepItems()[1]?.getAttribute('data-step-done')).toBe('true')
  })

  it('checks step 3 off at feedback 0.85 and announces it politely', () => {
    const { rerender } = render(<FirstLoop query="" />)
    rerender(<FirstLoop query="fb=0.84" />)
    expect(stepItems()[2]?.getAttribute('data-step-done')).toBe('false')
    rerender(<FirstLoop query="fb=0.9" />)
    expect(stepItems()[2]?.getAttribute('data-step-done')).toBe('true')
    const live = document.querySelector('[data-first-loop-announce]')
    expect(live?.getAttribute('aria-live')).toBe('polite')
    expect(live?.textContent).toBe('Step three done — the playback level is up.')
  })

  it('reveals the payoff once all three are done, and persists completion', () => {
    const { rerender } = render(<FirstLoop query="" />)
    act(() => claimVoice(voice('The Rig')))
    rerender(<FirstLoop query="d=3&fb=0.9" />)
    expect(screen.getByText(/Now stop playing/)).toBeTruthy()
    expect(screen.getByRole('link', { name: /two cycles/i }).getAttribute('href')).toBe(
      '/two-cycles/'
    )
    expect(window.localStorage.getItem(FIRST_LOOP_DONE_KEY)).toBe('true')
  })

  it('never renders again once a previous visit completed it', () => {
    window.localStorage.setItem(FIRST_LOOP_DONE_KEY, 'true')
    render(<FirstLoop query="" />)
    expect(document.querySelector('[data-first-loop]')).toBeNull()
  })

  it('dismisses quietly and persists the dismissal', () => {
    render(<FirstLoop query="" />)
    fireEvent.click(screen.getByRole('button', { name: /got it/i }))
    expect(document.querySelector('[data-first-loop]')).toBeNull()
    expect(window.localStorage.getItem(FIRST_LOOP_DISMISSED_KEY)).toBe('true')
  })

  it('stays hidden on the next visit after a dismissal', () => {
    window.localStorage.setItem(FIRST_LOOP_DISMISSED_KEY, 'true')
    render(<FirstLoop query="" />)
    expect(document.querySelector('[data-first-loop]')).toBeNull()
  })

  it('survives storage being unavailable: still renders, still dismisses, still grades', () => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: undefined, // every access throws — the private-mode shape
    })
    const { rerender } = render(<FirstLoop query="" />)
    expect(document.querySelector('[data-first-loop]')).toBeTruthy()
    // Completing every step writes nothing but still shows the payoff.
    act(() => claimVoice(voice('The Rig')))
    rerender(<FirstLoop query="d=3&fb=0.9" />)
    expect(screen.getByText(/Now stop playing/)).toBeTruthy()
    // Dismissal still hides the card for this visit.
    fireEvent.click(screen.getByRole('button', { name: /got it/i }))
    expect(document.querySelector('[data-first-loop]')).toBeNull()
  })
})
