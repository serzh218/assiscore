import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let isProFlag = false;
let project: any = {
  id: 'p1',
  ownerId: 'u1',
  title: 'Test',
  visibility: 'public',
  status: 'draft',
};
let projectFiles: Record<string, string> = {};

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}));

vi.mock('@/server/guards/privacy', () => ({
  assertProjectOwnership: vi.fn(async () => {}),
}));

vi.mock('@/server/repo/user', () => ({
  isPro: vi.fn(async () => isProFlag),
}));

vi.mock('@/server/repo/project', () => ({
  getProjectFiles: vi.fn(async () => projectFiles),
  updateProjectArtifacts: vi.fn(async (_id: string, data: any) => {
    project = { ...project, ...data };
    return project;
  }),
  getProjectById: vi.fn(async () => project),
}));

vi.mock('@/server/integrations/deploy', () => ({
  deploySite: vi.fn(async ({ provider, project: prj }) => ({
    deployUrl: `https://${prj.id}.${provider}.mock`,
    providerProjectUrl: `https://${provider}.mock/${prj.id}`,
  })),
}));

describe('deploy API', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    isProFlag = false;
    project.status = 'draft';
    project.deployUrl = undefined;
    project.lastDeployedAt = undefined;
    projectFiles = {};
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('rejects free plan', async () => {
    const { POST } = await import('@/app/api/projects/[id]/deploy/route');
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({ provider: 'vercel' }) }), { params: { id: 'p1' } } as any);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.code).toBe('PRO_REQUIRED');
  });

  it('returns error for empty project', async () => {
    isProFlag = true;
    const { POST } = await import('@/app/api/projects/[id]/deploy/route');
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({ provider: 'vercel' }) }), { params: { id: 'p1' } } as any);
    expect(res.status).toBe(400);
  });

  it('deploys project and reports status', async () => {
    isProFlag = true;
    projectFiles = { 'index.html': '<h1>Hello</h1>' };
    const { POST, GET } = await import('@/app/api/projects/[id]/deploy/route');
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({ provider: 'vercel' }) }), { params: { id: 'p1' } } as any);
    expect(res.status).toBe(200);
    expect(project.status).toBe('deploying');
    expect(project.deployUrl).toBeTruthy();

    const statusRes = await GET(new Request('http://test/api/projects/p1/deploy?projectId=p1'), { params: { id: 'p1' } } as any);
    const statusData = await statusRes.json();
    expect(statusData.stepStatus).not.toBe('done');

    await vi.runAllTimersAsync();
    await Promise.resolve();

    const statusRes2 = await GET(new Request('http://test/api/projects/p1/deploy?projectId=p1'), { params: { id: 'p1' } } as any);
    const statusData2 = await statusRes2.json();
    expect(statusData2.stepStatus).toBe('done');
    expect(project.status).toBe('ready');
    expect(project.lastDeployedAt).toBeTruthy();
  });
});
