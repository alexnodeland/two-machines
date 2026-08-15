import { describe, expect, it } from 'vitest'
import { getPreset, RIG_PRESETS } from '../audio/rig/presets'
import { sanitizeParams } from '../audio/rig/params'
import {
  PRACTICE_CARDS,
  practiceCardForLesson,
  practiceSettingsLine,
} from './practiceCards'

describe('the practice-card data', () => {
  it('carries exactly one card per grammar lesson, in order', () => {
    expect(PRACTICE_CARDS.map((c) => c.lesson)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('every card resolves to a real preset — settings are derived, never copied', () => {
    for (const card of PRACTICE_CARDS) {
      expect(getPreset(card.presetId), card.presetId).toBeDefined()
    }
  })

  it('matches each lesson to the preset its chapter section deep-links', () => {
    expect(PRACTICE_CARDS.map((c) => c.presetId)).toEqual([
      'three-notes',
      'beeping',
      'not-committing',
      'mud',
      'swells',
      'sequence-plan',
    ])
  })

  it('every card has a title, a move and a listen-for line', () => {
    for (const card of PRACTICE_CARDS) {
      expect(card.title.length).toBeGreaterThan(0)
      expect(card.move.length).toBeGreaterThan(0)
      expect(card.listenFor.length).toBeGreaterThan(0)
    }
  })

  it('looks a lesson up by number, and answers undefined off the curriculum', () => {
    expect(practiceCardForLesson(2)?.title).toBe('Beeping and droning')
    expect(practiceCardForLesson(7)).toBeUndefined()
    expect(practiceCardForLesson(0)).toBeUndefined()
  })
})

describe('practiceSettingsLine', () => {
  it("prints lesson 2's row exactly as the preset defines it", () => {
    const params = getPreset('beeping')?.params
    expect(params).toBeDefined()
    expect(practiceSettingsLine(params as NonNullable<typeof params>)).toBe(
      '4.0 s of tape (76 cm at 7½ ips) · playback 0.78 · record head 0.9 · ' +
        'monitor 0.75 · tape age 0.34'
    )
  })

  it('derives centimetres from the same pure math at every tape speed', () => {
    expect(practiceSettingsLine(sanitizeParams({ speed: '3.75' }))).toContain(
      '(40 cm at 3¾ ips)'
    )
    expect(practiceSettingsLine(sanitizeParams({ speed: '15' }))).toContain(
      '(160 cm at 15 ips)'
    )
  })

  it('trims float noise the way the URL codec does', () => {
    expect(practiceSettingsLine(sanitizeParams({ recordHead: 0.9 }))).toContain(
      'record head 0.9 ·'
    )
  })

  it('holds for every preset the rig ships', () => {
    for (const preset of RIG_PRESETS) {
      const line = practiceSettingsLine(preset.params)
      expect(line).toContain(`${preset.params.distanceSeconds.toFixed(1)} s of tape`)
      expect(line).toContain('7½ ips')
    }
  })
})
