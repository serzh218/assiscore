import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/db'
import { applyUnifiedDiff } from '@/lib/diff'
import { proposeFixes } from '@/server/ai/tests/fixer'
import { runTestsInSandbox } from '@/server/tests/runner'
import { getCycleData, setCycleData } from '@/server/tests/orchestrator'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json()
  const { cycleId, acceptDiff } = body as { cycleId: string; acceptDiff: boolean }
  const cycle = getCycleData(cycleId)
  if (!cycle) {
    return new Response(JSON.stringify({ error: 'not_found' }), { status: 404 })
  }
  const diff = await proposeFixes({
    projectId: params.id,
    report: cycle.lastReport,
    logs: cycle.lastLogs,
  })
  if (!acceptDiff) {
    return new Response(JSON.stringify({ diff }), {
      headers: { 'content-type': 'application/json' },
    })
  }
  const files: Record<string, string> = {}
  const lines = diff.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('--- ')) {
      const oldPath = lines[i].slice(4).trim().replace(/^a\//, '')
      const newPath = lines[i + 1]?.slice(4).trim().replace(/^b\//, '') || oldPath
      const filePath = newPath === '/dev/null' ? oldPath : newPath
      try {
        files[filePath] = fs.readFileSync(filePath, 'utf8')
      } catch {
        files[filePath] = ''
      }
    }
  }
  const applied = applyUnifiedDiff(files, diff)
  for (const [p, c] of Object.entries(applied.files)) {
    fs.mkdirSync(path.dirname(p), { recursive: true })
    fs.writeFileSync(p, c, 'utf8')
  }
  const res = await runTestsInSandbox({ projectId: params.id, filesOverride: cycle.tests })
  const run = await prisma.testRun.create({
    data: {
      cycleId,
      status: res.ok ? 'passed' : 'failed',
      testsTotal: res.summary.total,
      testsFailed: res.summary.failed,
      reportJson: res.report,
      logs: res.logs,
    },
  })
  setCycleData(cycleId, { tests: cycle.tests, lastReport: res.report, lastLogs: res.logs })
  return new Response(JSON.stringify({ runId: run.id, summary: res.summary, diffApplied: true }), {
    headers: { 'content-type': 'application/json' },
  })
}
