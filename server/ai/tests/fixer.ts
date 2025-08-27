import fs from 'fs'

import { generateDiffBundle } from '@/lib/ai/llm'

interface FixArgs {
  projectId: string
  report: any
  logs: string
}

export async function proposeFixes({
  projectId: _projectId,
  report,
  logs,
}: FixArgs): Promise<string> {
  const failed: Array<{ file: string; message: string }> = []
  for (const suite of report?.suites || []) {
    for (const t of suite.tests || []) {
      if (t.error) failed.push({ file: suite.file, message: t.error.message })
    }
  }
  if (failed.length === 0) return ''
  const files: Record<string, string> = {}
  for (const f of failed) {
    try {
      files[f.file] = fs.readFileSync(f.file, 'utf8')
    } catch {
      // ignore
    }
  }
  const message = failed
    .map((f) => `${f.file}: ${f.message}`)
    .concat(logs)
    .join('\n')
  const bundle = await generateDiffBundle({ message, files })
  return bundle.diffs.map((d) => `--- a/${d.path}\n+++ b/${d.path}\n${d.diff}`).join('\n')
}
