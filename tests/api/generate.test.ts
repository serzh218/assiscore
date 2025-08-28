import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

vi.mock('@/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1', tokens: 1000, plan: 'FREE' })),
}))

let projectStatus = 'building'
const project = {
  id: 'p1',
  ownerId: 'u1',
  visibility: 'public',
  title: 'Test',
  type: 'site',
  spec: {},
  status: projectStatus,
  createdAt: new Date(),
} as any

let genLogs = ''

vi.mock('@/server/repo/project', () => ({
  createProject: vi.fn(async () => ({ ...project, status: 'building' })),
  getProjectById: vi.fn(async () => ({ ...project, status: projectStatus })),
  updateProjectStatus: vi.fn(async (_id: string, status: string) => {
    projectStatus = status
    return { ...project, status }
  }),
}))

vi.mock('@/server/repo/generation', () => ({
  createGeneration: vi.fn(async () => ({
    id: 'g1',
    projectId: 'p1',
    costTokens: 10,
    logs: '',
    createdAt: new Date(),
  })),
  appendGenerationLogs: vi.fn(async (_id: string, chunk: string) => {
    genLogs += chunk
    return { id: 'g1', projectId: 'p1', costTokens: 10, logs: genLogs, createdAt: new Date() }
  }),
  listGenerations: vi.fn(async () => [
    { id: 'g1', projectId: 'p1', costTokens: 10, logs: genLogs, createdAt: new Date() },
  ]),
}))

vi.mock('@/server/ai/orchestrator', () => ({
  runGenerationPipeline: vi.fn(async () => {}),
}))

vi.mock('@/server/guards/limits', () => ({
  assertCanGenerate: vi.fn(async () => {}),
  spendTokens: vi.fn(async () => {}),
}))

vi.mock('@/server/guards/entitlements', () => ({
  assertEntitlements: vi.fn(async () => {}),
  PaywallError: class extends Error {},
}))

describe('generate API', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    projectStatus = 'building'
    genLogs = ''
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('creates project and returns status with logs', async () => {
    const { POST } = await import('@/app/api/generate/route')
    const res = await POST(
      new Request('http://test/api/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Hello' }),
      }),
    )
    const data = await res.json()
    expect(data.projectId).toBe('p1')

    await vi.runAllTimersAsync()
    await Promise.resolve()

    const { GET } = await import('@/app/api/generate/status/route')
    const statusRes = await GET(new Request('http://test/api/generate/status?projectId=p1'))
    const statusData = await statusRes.json()
    expect(statusData.status).not.toBe('error')
    expect(Array.isArray(statusData.logs)).toBe(true)
  })
})
