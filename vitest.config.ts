import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // ← non-negotiable: without `all`, 100% is reachable by simply not
      //   importing your worst module (testing-strategy §3).
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/pages/**', // Gatsby page shells; covered by e2e
        'src/templates/**', // ditto: routing shells for MDX chapters
        'src/data/sources.generated.ts', // generated from references/sources.yaml
        '**/__mocks__/**',
      ],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
})
