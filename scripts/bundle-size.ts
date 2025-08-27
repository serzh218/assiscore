import fs from 'fs'
import path from 'path'

import { QUALITY } from '../quality.config'

function getFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const e of entries) {
    const res = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...getFiles(res))
    else files.push(res)
  }
  return files
}

export function calculateBundleSize(nextDir = '.next'): { totalKB: number; deltaKB: number } {
  const files = getFiles(path.join(nextDir, 'static')).filter(
    (f) => f.endsWith('.js') || f.endsWith('.css'),
  )
  const total = files.reduce((sum, f) => sum + fs.statSync(f).size, 0) / 1024
  let baseline = 0
  if (fs.existsSync('bundle-baseline.json')) {
    baseline = JSON.parse(fs.readFileSync('bundle-baseline.json', 'utf8')).totalKB || 0
  }
  return { totalKB: total, deltaKB: total - baseline }
}

import { pathToFileURL } from 'url'

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const res = calculateBundleSize()
  console.log(JSON.stringify(res))
  if (res.deltaKB > QUALITY.bundle.maxKbDelta) {
    console.warn('Bundle size increase exceeds limit')
  }
}
