import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      'node_modules/**',
      'public/**',
      '.cache/**',
      'coverage/**',
      'src/gatsby-types.d.ts',
      'mockups/**',
      'references/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    // src/audio/math is PURE: functions of numbers only, importable by anything,
    // importing nothing outside itself (ADR-027). If this boundary erodes,
    // 100% coverage stops being meaningful.
    files: ['src/audio/math/**/*.ts'],
    ignores: ['src/audio/math/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**', '!./**'],
              message:
                'src/audio/math is pure (ADR-027): no imports from outside the directory.',
            },
          ],
        },
      ],
    },
  }
)
