import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/ai/llm', () => ({
  generateDiffBundle: vi.fn(async () => ({
    diffs: [
      {
        path: 'lib/tf.ts',
        diff: `@@ -1,3 +1,3 @@\n-export function inc(x: number): number {\n-  return x;\n-}\n+export function inc(x: number): number {\n+  return x + 1;\n+}\n`,
      },
    ],
  })),
}))

import { proposeFixes } from '@/server/ai/tests/fixer'

describe('proposeFixes', () => {
  it('returns diff for failing report', async () => {
    const report = {
      suites: [
        {
          file: '__tests__/inc.test.ts',
          tests: [{ name: 'inc', error: { message: 'expected 2 received 1' } }],
        },
      ],
    } as any
    const diff = await proposeFixes({ projectId: 'p1', report, logs: '' })
    expect(diff).toContain('+  return x + 1;')
  })
})
