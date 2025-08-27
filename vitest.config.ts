import path from 'path'

import { defineConfig } from 'vitest/config'

import { QUALITY } from './quality.config'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    coverage: {
      enabled: true,
      provider: 'v8',
      lines: QUALITY.coverage.global.lines,
      statements: QUALITY.coverage.global.statements,
      branches: QUALITY.coverage.global.branches,
      functions: QUALITY.coverage.global.functions,
    },
  },
})
