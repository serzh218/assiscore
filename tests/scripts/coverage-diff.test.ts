import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'fs'
import path from 'path'

import { checkCoverage } from '../../scripts/coverage-diff'
import { QUALITY } from '../../quality.config'

describe('coverage-diff', () => {
  const tmp = path.join(process.cwd(), 'tmp-coverage')
  beforeAll(() => {
    fs.mkdirSync(tmp, { recursive: true })
  })
  afterAll(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it('fails when file below threshold', () => {
    const file = 'a.ts'
    const cov = { [file]: { lines: { pct: QUALITY.coverage.perFile - 1 } } }
    const fp = path.join(tmp, 'coverage-final.json')
    fs.writeFileSync(fp, JSON.stringify(cov))
    const res = checkCoverage({ coveragePath: fp, changedFiles: [file] })
    expect(res.length).toBe(1)
  })

  it('passes when coverage sufficient', () => {
    const file = 'b.ts'
    const cov = { [file]: { lines: { pct: QUALITY.coverage.perFile + 10 } } }
    const fp = path.join(tmp, 'coverage-final.json')
    fs.writeFileSync(fp, JSON.stringify(cov))
    const res = checkCoverage({ coveragePath: fp, changedFiles: [file] })
    expect(res.length).toBe(0)
  })
})
