import { describe, it, expect, vi } from 'vitest'
import { NextResponse } from 'next/server'

let projectFiles: Record<string, string> = { current: 'x' }

vi.mock('@/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}))

vi.mock('@/server/repo/project', () => ({
  getProjectById: vi.fn(async () => ({ id: 'p1', ownerId: 'u1' })),
  setProjectFiles: vi.fn(async (_id: string, files: Record<string, string>) => {
    projectFiles = files
  }),
  touchProjectBuild: vi.fn(async () => {}),
}))

vi.mock('@/server/repo/version', () => ({
  getVersion: vi.fn(async () => ({ id: 'v1', projectId: 'p1', files: { a: 'old' } })),
  saveVersion: vi.fn(async () => 'v2'),
}))

vi.mock('@/server/queue/generationQueue', () => ({
  enqueueRebuild: vi.fn(async () => {}),
}))

describe('rollback API', () => {
  it('rolls back project files', async () => {
    const { POST } = await import('@/app/api/projects/[id]/versions/[versionId]/rollback/route')
    const res = await POST(new Request('http://test', { method: 'POST' }), {
      params: { id: 'p1', versionId: 'v1' },
    } as any)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(projectFiles).toEqual({ a: 'old' })
  })
})
