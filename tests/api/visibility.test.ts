import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSet = vi.fn(async (_id: string, visibility: string) => ({
  id: _id,
  ownerId: 'u1',
  visibility,
  title: '',
  type: '',
  spec: {},
  status: 'draft',
  createdAt: new Date(),
}))

vi.mock('@/server/repo/project', () => ({
  setProjectVisibility: mockSet,
}))

vi.mock('@/server/guards/privacy', () => ({
  assertProjectOwnership: vi.fn(async () => {}),
  assertCanSetPrivate: vi.fn(async () => {
    throw Object.assign(new Error('Приватные проекты доступны на PRO'), { code: 'PRO_REQUIRED' })
  }),
}))

vi.mock('@/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1', plan: 'FREE' })),
}))

describe('visibility API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('free user cannot set private', async () => {
    const { POST } = await import('@/app/api/projects/[id]/visibility/route')
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ visibility: 'private' }),
      }),
      { params: { id: 'p1' } },
    )
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.code).toBe('PRO_REQUIRED')
  })

  it('pro user can toggle', async () => {
    const guards = await import('@/server/guards/privacy')
    ;(guards.assertCanSetPrivate as any).mockImplementation(async () => {})
    const auth = await import('@/auth')
    ;(auth.getCurrentUser as any).mockResolvedValue({ id: 'u1', plan: 'PRO' })
    const { POST } = await import('@/app/api/projects/[id]/visibility/route')
    const res1 = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ visibility: 'private' }),
      }),
      { params: { id: 'p1' } },
    )
    expect(res1.status).toBe(200)
    const res2 = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ visibility: 'public' }),
      }),
      { params: { id: 'p1' } },
    )
    expect(res2.status).toBe(200)
    expect(mockSet).toHaveBeenCalledWith('p1', 'public')
  })
})
