import { execSync } from 'child_process'
import fs from 'fs'
import { pathToFileURL } from 'url'

import { QUALITY } from '../quality.config'

export type CoverageSummary = {
  [file: string]: {
    lines: { pct: number }
  }
}

function getChangedFiles(
  base = process.env.GITHUB_BASE_REF || 'origin/main',
  head = process.env.GITHUB_HEAD_REF || 'HEAD',
) {
  const output = execSync(`git diff --name-only ${base}...${head}`, { encoding: 'utf8' })
  return output.split('\n').filter((f) => f.endsWith('.ts') || f.endsWith('.tsx'))
}

export function checkCoverage({
  coveragePath = 'coverage/coverage-final.json',
  changedFiles = getChangedFiles(),
} = {}) {
  if (changedFiles.length === 0) return []
  const coverage: CoverageSummary = JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
  const fails: { file: string; pct: number }[] = []
  for (const file of changedFiles) {
    const entry = coverage[file]
    const pct = entry?.lines?.pct ?? 0
    if (pct < QUALITY.coverage.perFile) {
      fails.push({ file, pct })
    }
  }
  return fails
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fails = checkCoverage()
  if (fails.length) {
    console.error('Coverage per-file failed:', fails)
    process.exit(1)
  }
  console.log('Per-file coverage ok')
}
