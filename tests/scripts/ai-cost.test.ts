import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

import { estimateTokens } from '../../scripts/ai-cost-estimate'

describe('ai-cost', () => {
  it('estimates tokens from changed files', () => {
    const file = path.join(process.cwd(), 'tmp.txt')
    fs.writeFileSync(file, 'a'.repeat(80))
    const tokens = estimateTokens([file])
    expect(tokens).toBeGreaterThan(0)
    fs.unlinkSync(file)
  })
})
