import { describe, it, expect } from 'vitest'
import { runTestsInSandbox } from '@/server/tests/runner'

describe('runTestsInSandbox', () => {
  it('runs passing tests', async () => {
    const result = await runTestsInSandbox({
      projectId: 'p1',
      filesOverride: {
        '__tests__/pass.test.ts':
          "import { it, expect } from 'vitest'; it('adds', () => { expect(1+1).toBe(2); });",
      },
    })
    expect(result.ok).toBe(true)
    expect(result.summary.failed).toBe(0)
  }, 20000)

  it('reports failing tests', async () => {
    const result = await runTestsInSandbox({
      projectId: 'p1',
      filesOverride: {
        '__tests__/fail.test.ts':
          "import { it, expect } from 'vitest'; it('adds', () => { expect(1+1).toBe(3); });",
      },
    })
    expect(result.ok).toBe(false)
    expect(result.summary.failed).toBe(1)
  }, 20000)
})
