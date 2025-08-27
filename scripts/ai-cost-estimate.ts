import fs from 'fs'
import { execSync } from 'child_process'
import { pathToFileURL } from 'url'

import { QUALITY } from '../quality.config'

function getChangedFiles(
  base = process.env.GITHUB_BASE_REF || 'origin/main',
  head = process.env.GITHUB_HEAD_REF || 'HEAD',
) {
  const out = execSync(`git diff --name-only ${base}...${head}`, { encoding: 'utf8' })
  return out.split('\n').filter((f) => f)
}

export function estimateTokens(files: string[]): number {
  let chars = 0
  for (const f of files) {
    if (fs.existsSync(f)) {
      chars += fs.readFileSync(f, 'utf8').length
    }
  }
  return Math.ceil(chars / 4)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = getChangedFiles()
  const estimatedTokensDelta = estimateTokens(files)
  console.log(JSON.stringify({ estimatedTokensDelta }))
  if (estimatedTokensDelta > QUALITY.aiCost.warnTokensDelta) {
    console.warn('AI cost delta exceeds warn threshold')
  }
}
