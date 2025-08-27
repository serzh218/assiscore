import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u2', plan: 'FREE' })),
}))

vi.mock('@/server/repo/project', () => ({
  getProjectById: vi.fn(async () => ({
    id: 'p1',
    ownerId: 'u1',
    visibility: 'public',
    title: '',
    type: '',
    spec: {},
    status: 'draft',
    createdAt: new Date(),
  })),
  forkProject: vi.fn(async ({ newOwnerId }: any) => ({
    id: 'p2',
    ownerId: newOwnerId,
    visibility: 'public',
    title: '',
    type: '',
    spec: {},
    status: 'draft',
    createdAt: new Date(),
  })),
}))

describe('fork API', () => {
  it('creates fork for user', async () => {
    const { POST } = await import('@/app/api/projects/[id]/fork/route')
    const res = await POST(new Request('http://test', { method: 'POST' }), { params: { id: 'p1' } })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.projectId).toBe('p2')
  })
})
