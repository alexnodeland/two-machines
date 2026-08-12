// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import * as React from 'react'
import { cleanup, render } from '@testing-library/react'
import { Spine } from './Spine'
import { setSpineHeat, SPINE_RUNAWAY_ATTR } from './spineHeat'

afterEach(() => {
  cleanup()
  setSpineHeat(0)
})

const heat = (): string => document.documentElement.style.getPropertyValue('--spine-heat')

describe('the spine', () => {
  it('renders one decorative line and nothing else', () => {
    render(<Spine />)
    const spine = document.querySelector('[data-spine]')
    expect(spine).toBeTruthy()
    expect(spine?.getAttribute('aria-hidden')).toBe('true')
    expect(spine?.childNodes.length).toBe(0)
  })

  it('publishes heat as the 0–1 custom property', () => {
    setSpineHeat(0.75)
    expect(heat()).toBe('0.750')
    setSpineHeat(0)
    expect(heat()).toBe('0.000')
  })

  it('clamps into 0–1 and never goes negative', () => {
    setSpineHeat(-3)
    expect(heat()).toBe('0.000')
    setSpineHeat(1.18)
    expect(heat()).toBe('1.000')
  })

  it('flags past-unity on the root, and clears it below', () => {
    setSpineHeat(1.06)
    expect(document.documentElement.getAttribute(SPINE_RUNAWAY_ATTR)).toBe('true')
    setSpineHeat(0.9)
    expect(document.documentElement.getAttribute(SPINE_RUNAWAY_ATTR)).toBeNull()
  })
})
