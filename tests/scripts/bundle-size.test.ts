import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

import { calculateBundleSize } from '../../scripts/bundle-size'

describe('bundle-size', () => {
  it('sums js and css files', () => {
    const dir = path.join(process.cwd(), '.next/static')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'a.js'), 'a'.repeat(1024))
    fs.writeFileSync(path.join(dir, 'b.css'), 'b'.repeat(1024))
    const res = calculateBundleSize('.next')
    expect(Math.round(res.totalKB)).toBe(2)
    fs.rmSync('.next', { recursive: true, force: true })
  })
})
