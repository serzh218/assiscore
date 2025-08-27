import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/ai/llm', () => ({
  generateFileBundle: vi.fn(async () => ({
    files: [
      {
        path: '__tests__/inc.test.ts',
        content:
          "import { it, expect } from 'vitest';\nimport { inc } from '@/lib/tf';\nit('inc', () => { expect(inc(1)).toBe(2); });",
      },
    ],
  })),
}))

vi.mock('@/server/ai/context', () => ({
  makeCodeContext: vi.fn(async () => ({ content: '// code' })),
}))

describe('generateTests', () => {
  it('returns test files', async () => {
    const { generateTests } = await import('@/server/ai/tests/generator')
    const files = await generateTests({ projectId: 'p1', targetPath: 'lib/tf.ts' })
    expect(files['__tests__/inc.test.ts']).toBeTypeOf('string')
  })
})
