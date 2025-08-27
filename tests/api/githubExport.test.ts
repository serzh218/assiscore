import { describe, it, expect, beforeEach, vi } from 'vitest'

let savedRepoUrl: string | null = null

vi.mock('@/auth', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/server/repo/project', () => ({
  getProjectById: vi.fn(async () => ({
    id: 'p1',
    ownerId: 'u1',
    title: 'Test',
    type: 'site',
    spec: {},
    visibility: 'public',
    status: 'draft',
    createdAt: new Date(),
  })),
  getProjectFiles: vi.fn(async () => ({ 'index.ts': 'content' })),
  updateProjectArtifacts: vi.fn(async (_id: string, { repoUrl }: any) => {
    savedRepoUrl = repoUrl
  }),
}))

vi.mock('@/server/integrations/github', () => ({
  createRepo: vi.fn(async (user: any, { project }: any) => ({
    repoUrl: `https://github.com/${user.githubUsername || 'demo'}/${project.title}`,
  })),
  pushFiles: vi.fn(async () => {}),
}))

describe('github export API', () => {
  beforeEach(() => {
    savedRepoUrl = null
  })

  it('free user forbidden', async () => {
    const { getCurrentUser } = await import('@/auth')
    ;(getCurrentUser as any).mockResolvedValue({ id: 'u1', plan: 'FREE', githubLinked: false })
    const { POST } = await import('@/app/api/projects/[id]/export/github/route')
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ visibility: 'public' }),
      }),
      { params: { id: 'p1' } },
    )
    expect(res.status).toBe(403)
  })

  it('pro user without github', async () => {
    const { getCurrentUser } = await import('@/auth')
    ;(getCurrentUser as any).mockResolvedValue({ id: 'u1', plan: 'PRO', githubLinked: false })
    const { POST } = await import('@/app/api/projects/[id]/export/github/route')
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ visibility: 'public' }),
      }),
      { params: { id: 'p1' } },
    )
    expect(res.status).toBe(400)
  })

  it('pro user with github', async () => {
    const { getCurrentUser } = await import('@/auth')
    ;(getCurrentUser as any).mockResolvedValue({
      id: 'u1',
      plan: 'PRO',
      githubLinked: true,
      githubUsername: 'gh',
    })
    const { POST } = await import('@/app/api/projects/[id]/export/github/route')
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ visibility: 'public' }),
      }),
      { params: { id: 'p1' } },
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.repoUrl).toBeDefined()
    expect(savedRepoUrl).toBe(data.repoUrl)
  })
})
