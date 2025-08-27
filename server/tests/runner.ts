import { execFile } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

interface RunArgs {
  projectId: string
  filesOverride?: Record<string, string>
}

export async function runTestsInSandbox({
  projectId: _projectId,
  filesOverride = {},
}: RunArgs): Promise<{
  ok: boolean
  summary: { total: number; failed: number }
  report: any
  logs: string
}> {
  const base = path.join(process.cwd(), '.sandbox')
  await fs.promises.mkdir(base, { recursive: true })
  const tmp = await fs.promises.mkdtemp(path.join(base, 'run-'))
  try {
    for (const [p, c] of Object.entries(filesOverride)) {
      const full = path.join(tmp, p)
      await fs.promises.mkdir(path.dirname(full), { recursive: true })
      await fs.promises.writeFile(full, c)
    }
    const vitestBin = path.resolve('node_modules', 'vitest', 'vitest.mjs')
    const files = Object.keys(filesOverride).map((f) => path.join(tmp, f))
    const args = ['run', '--reporter=json', '--environment=jsdom', '--coverage=false', ...files]
    let stdout = ''
    let stderr = ''
    try {
      const res = await promisify(execFile)('node', [vitestBin, ...args], { cwd: process.cwd() })
      stdout = res.stdout
      stderr = res.stderr
    } catch (err: any) {
      stdout = err.stdout || ''
      stderr = err.stderr || String(err)
    }
    let report: any = {}
    try {
      report = JSON.parse(stdout)
    } catch {
      // ignore
    }
    const summary = { total: report.numTotalTests ?? 0, failed: report.numFailedTests ?? 0 }
    return { ok: summary.failed === 0, summary, report, logs: stderr }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
}
