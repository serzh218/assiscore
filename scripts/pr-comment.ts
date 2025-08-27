import fs from 'fs'
import { pathToFileURL } from 'url'

import { QUALITY } from '../quality.config'
import en from '../i18n/en/quality.json' assert { type: 'json' }

export function buildComment({
  coverage,
  bundle,
  aiCost,
  previewUrl,
}: {
  coverage: { lines: number; gate: number; perFile: string }
  bundle: { deltaKB: number }
  aiCost: { tokens: number }
  previewUrl?: string
}) {
  return [
    `### 🔍 ${en.report.title}`,
    `**Coverage**: lines ${coverage.lines}% (gate ${coverage.gate}%), per-file: ${coverage.perFile}`,
    `**Bundle Δ**: +${bundle.deltaKB} KB (limit +${QUALITY.bundle.maxKbDelta} KB)`,
    `**AI Cost Δ**: ~${aiCost.tokens} tokens (warn @ ${QUALITY.aiCost.warnTokensDelta})`,
    `**Preview**: ${previewUrl ?? '—'}`,
  ].join('\n')
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [coverageFile, bundleFile, aiFile, previewUrl] = process.argv.slice(2)
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'))
  const bundle = JSON.parse(fs.readFileSync(bundleFile, 'utf8'))
  const aiCost = JSON.parse(fs.readFileSync(aiFile, 'utf8'))
  const md = buildComment({ coverage, bundle, aiCost, previewUrl })
  console.log(md)
}
