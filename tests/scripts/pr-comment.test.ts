import { describe, it, expect } from 'vitest'

import { buildComment } from '../../scripts/pr-comment'

import { QUALITY } from '../../quality.config'

describe('pr-comment', () => {
  it('builds markdown summary', () => {
    const md = buildComment({
      coverage: { lines: 80, gate: QUALITY.coverage.global.lines, perFile: 'OK' },
      bundle: { deltaKB: 10 },
      aiCost: { tokens: 100 },
      previewUrl: 'https://example.com',
    })
    expect(md).toContain('Quality Report')
    expect(md).toContain('https://example.com')
  })
})
