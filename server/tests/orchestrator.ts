import { runTestsInSandbox } from './runner'

import { prisma } from '@/lib/db'
import { generateTests } from '@/server/ai/tests/generator'

const cycleStore = new Map<
  string,
  { tests: Record<string, string>; lastReport: any; lastLogs: string }
>()

interface CycleArgs {
  projectId: string
  userId: string
  targetPath?: string
  selection?: { start: number; end: number; content: string }
  prompt?: string
}

export async function runTestFirstCycle({
  projectId,
  userId,
  targetPath,
  selection,
  prompt,
}: CycleArgs) {
  const cycle = await prisma.testCycle.create({
    data: { projectId, userId, status: 'running', targetPath, prompt },
  })
  const tests = await generateTests({ projectId, targetPath, selection, prompt })
  const res = await runTestsInSandbox({ projectId, filesOverride: tests })
  const run = await prisma.testRun.create({
    data: {
      cycleId: cycle.id,
      status: res.ok ? 'passed' : 'failed',
      testsTotal: res.summary.total,
      testsFailed: res.summary.failed,
      reportJson: res.report,
      logs: res.logs,
    },
  })
  cycleStore.set(cycle.id, { tests, lastReport: res.report, lastLogs: res.logs })
  return {
    cycleId: cycle.id,
    runId: run.id,
    summary: res.summary,
    failedTests: extractFailed(res.report),
  }
}

function extractFailed(
  report: any,
): Array<{ id: string; title: string; file: string; message: string }> {
  const failed: Array<{ id: string; title: string; file: string; message: string }> = []
  for (const suite of report?.suites || []) {
    for (const t of suite.tests || []) {
      if (t.error)
        failed.push({ id: t.name, title: t.name, file: suite.file, message: t.error.message })
    }
  }
  return failed
}

export function getCycleData(cycleId: string) {
  return cycleStore.get(cycleId)
}

export function setCycleData(
  cycleId: string,
  data: { tests: Record<string, string>; lastReport: any; lastLogs: string },
) {
  cycleStore.set(cycleId, data)
}
