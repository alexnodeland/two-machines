// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import * as React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import {
  attachArbiterAudio,
  claimVoice,
  getArbiterState,
  resetArbiterForTests,
  type Voice,
} from '../../audio/arbiter'
import { SoundBar } from './SoundBar'

afterEach(() => {
  cleanup()
  resetArbiterForTests()
})

const makeVoice = (label: string): Voice & { log: string[] } => {
  const log: string[] = []
  return {
    label,
    log,
    silence: () => log.push('silence'),
    dispose: () => log.push('dispose'),
  }
}

describe('SoundBar', () => {
  it('renders silent by default — the server state', () => {
    render(<SoundBar />)
    expect(screen.getByText('Silent')).toBeTruthy()
    expect(
      screen.getByRole('group', { name: 'Sound' }).getAttribute('data-sounding')
    ).toBe('false')
  })

  it('names the sounding voice as the arbiter changes', () => {
    render(<SoundBar />)
    act(() => claimVoice(makeVoice('The Rig')))
    expect(screen.getByText('Sounding — The Rig')).toBeTruthy()
  })

  it('drives master volume from the slider', () => {
    render(<SoundBar />)
    const log: string[] = []
    attachArbiterAudio({
      resume: () => {},
      suspend: () => {},
      setBusGain: (v) => log.push(`gain:${v}`),
    })
    fireEvent.change(screen.getByRole('slider', { name: 'Master volume' }), {
      target: { value: '0.3' },
    })
    expect(log).toContain('gain:0.3')
    expect(getArbiterState().volume).toBe(0.3)
  })

  it('the kill switch silences and disposes whatever is sounding', () => {
    render(<SoundBar />)
    const voice = makeVoice('The Rig')
    act(() => claimVoice(voice))
    fireEvent.click(screen.getByRole('button', { name: /Silence everything/ }))
    expect(voice.log).toEqual(['silence', 'dispose'])
    expect(screen.getByText('Silent')).toBeTruthy()
  })

  it('stops listening after unmount', () => {
    const { unmount } = render(<SoundBar />)
    unmount()
    expect(() => claimVoice(makeVoice('A'))).not.toThrow()
  })
})
