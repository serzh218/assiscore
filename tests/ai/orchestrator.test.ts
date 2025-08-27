import { describe, it, expect, vi } from 'vitest'

const project: any = {
  id: 'p1',
  ownerId: 'u1',
  visibility: 'public',
  status: 'building',
  files: {},
}

vi.mock('@/lib/ai/llm', () => ({
  generateFileBundle: vi.fn(async () => ({
    files: [
      {
        path: 'index.html',
        content: '<html><head><title>Test</title></head><body><h1>OK</h1></body></html>',
      },
      { path: 'styles/site.css', content: 'body{font-family:Inter}' },
    ],
  })),
}))

vi.mock('@/server/repo/project', () => ({
  updateProjectArtifacts: vi.fn(async (_id: string, data: any) => {
    Object.assign(project, { files: data.files, previewUrl: data.previewUrl, status: data.status })
    return project
  }),
  updateProjectStatus: vi.fn(async (_id: string, status: string) => {
    project.status = status
    return project
  }),
  getProjectById: vi.fn(async () => project),
}))

vi.mock('@/server/repo/generation', () => ({
  appendGenerationLogs: vi.fn(async () => {}),
}))

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}))

describe.skip('runGenerationPipeline', () => {
  it('creates preview', async () => {
    const { runGenerationPipeline } = await import('@/server/ai/orchestrator')
    await runGenerationPipeline({ user: { id: 'u1' }, project, spec: {}, generationId: 'g1' })
    expect(project.status).toBe('ready')
    const { GET } = await import('@/app/api/projects/[id]/preview/route')
    const res = await GET(new Request('http://test'), { params: { id: 'p1' } })
    const html = await res.text()
    expect(html).toContain('<h1>OK</h1>')
  })
})
