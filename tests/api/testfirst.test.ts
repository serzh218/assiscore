import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

vi.mock('@/lib/db', () => ({
  prisma: {
    testCycle: {
      create: vi.fn(async ({ data }: any) => ({ id: 'cycle1', ...data })),
      update: vi.fn(async ({ where, data }: any) => ({ id: where.id, ...data })),
    },
    testRun: { create: vi.fn(async ({ data }: any) => ({ id: `run${Math.random()}`, ...data })) },
  },
}))

vi.mock('@/server/ai/tests/generator', () => ({
  generateTests: vi.fn(async () => ({
    '__tests__/inc.test.ts':
      "import { it, expect } from 'vitest';\nimport { inc } from '@/lib/tf';\nit('inc', () => { expect(inc(1)).toBe(2); });",
  })),
}))

vi.mock('@/server/ai/tests/fixer', () => ({
  proposeFixes: vi.fn(
    async () =>
      `--- a/lib/tf.ts\n+++ b/lib/tf.ts\n@@ -1,3 +1,3 @@\n-export function inc(x: number): number {\n-  return x;\n-}\n+export function inc(x: number): number {\n+  return x + 1;\n+}\n`,
  ),
}))

vi.mock('@/server/tests/runner', async () => {
  const mod = await vi.importActual<any>('@/server/tests/runner')
  return {
    runTestsInSandbox: vi.fn(async (args: any) => mod.runTestsInSandbox(args)),
  }
})

import { POST as start } from '@/app/api/projects/[id]/test-first/start/route'
import { POST as iterate } from '@/app/api/projects/[id]/test-first/iterate/route'

describe('test-first API', () => {
  beforeEach(() => {
    fs.writeFileSync('lib/tf.ts', 'export function inc(x: number): number {\n  return x;\n}\n')
  })

  it('start -> preview -> apply', async () => {
    const resStart = await start(
      new Request('http://test', { method: 'POST', body: JSON.stringify({ prompt: 'test inc' }) }),
      { params: { id: 'p1' } },
    )
    const dataStart = await resStart.json()
    expect(dataStart.summary.failed).toBe(1)

    const resPreview = await iterate(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ cycleId: dataStart.cycleId, acceptDiff: false }),
      }),
      { params: { id: 'p1' } },
    )
    const dataPreview = await resPreview.json()
    expect(dataPreview.diff).toContain('+  return x + 1;')

    const resApply = await iterate(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ cycleId: dataStart.cycleId, acceptDiff: true }),
      }),
      { params: { id: 'p1' } },
    )
    const dataApply = await resApply.json()
    expect(dataApply.summary.failed).toBe(0)
  }, 20000)
})
