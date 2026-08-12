import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

class FakeAudioContext {
  static instances = 0
  constructor() {
    FakeAudioContext.instances++
  }
}

describe('getAudioContext', () => {
  beforeEach(() => {
    FakeAudioContext.instances = 0
    vi.stubGlobal('AudioContext', FakeAudioContext)
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('creates the context lazily and only once', async () => {
    const { getAudioContext, hasAudioContext } = await import('./context')
    expect(hasAudioContext()).toBe(false)
    expect(FakeAudioContext.instances).toBe(0)

    const first = getAudioContext()
    const second = getAudioContext()
    expect(first).toBe(second)
    expect(FakeAudioContext.instances).toBe(1)
    expect(hasAudioContext()).toBe(true)
  })
})

describe('the one-AudioContext guard (ADR-015)', () => {
  it('src/ contains exactly one AudioContext construction site: context.ts', () => {
    const srcRoot = path.resolve(__dirname, '..')
    const offenders: string[] = []
    const walk = (dir: string): void => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          walk(p)
        } else if (
          /\.(ts|tsx)$/.test(entry.name) &&
          !/\.test\.(ts|tsx)$/.test(entry.name)
        ) {
          const text = fs.readFileSync(p, 'utf8')
          const matches = text.match(/new\s+(?:window\.)?AudioContext\s*\(/g) ?? []
          for (let i = 0; i < matches.length; i++) offenders.push(p)
        }
      }
    }
    walk(srcRoot)

    expect(offenders).toHaveLength(1)
    expect(offenders[0]).toMatch(/src\/audio\/context\.ts$/)
  })
})
