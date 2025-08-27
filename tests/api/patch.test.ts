import { describe, it, expect, beforeEach, vi } from 'vitest';
import { COSTS } from '@/lib/limits';

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1', tokens: 100 }))
}));

let projectStatus = 'ready';
let files: Record<string, string> = {};
let spent = 0;
let patches: any[] = [];

vi.mock('@/server/repo/project', () => ({
  getProjectById: vi.fn(async () => ({ id: 'p1', ownerId: 'u1', visibility: 'public', title: 'Test', type: 'site', spec: {}, status: projectStatus, createdAt: new Date() })),
  getProjectFiles: vi.fn(async () => files),
  setProjectFiles: vi.fn(async (_id: string, f: Record<string, string>) => { files = f; }),
  touchProjectBuild: vi.fn(async (_id: string, status: string) => { projectStatus = status; })
}));

vi.mock('@/server/repo/patch', () => ({
  createPatch: vi.fn(async (data: any) => { patches.push(data); return { id: 'patch1', projectId: data.projectId, diff: data.diff, costTokens: data.costTokens, createdAt: new Date() }; })
}));

vi.mock('@/server/guards/limits', () => ({
  spendTokens: vi.fn(async (_uid: string, amount: number) => { spent = amount; })
}));

vi.mock('@/server/patch/mockPatchGenerator', () => ({
  generatePatchFromMessage: vi.fn(async () => `--- /dev/null\n+++ b/app/(app)/about/page.tsx\n@@ -0,0 +1,3 @@\n+export default function AboutPage() {\n+  return <div>About</div>;\n+}\n`)
}));

vi.mock('@/server/queue/generationQueue', () => ({
  enqueueRebuild: vi.fn((_id: string) => { projectStatus = 'ready'; })
}));

describe('patch API', () => {
  beforeEach(() => {
    projectStatus = 'ready';
    files = {};
    spent = 0;
    patches = [];
  });

  it('applies patch and updates state', async () => {
    const { POST } = await import('@/app/api/projects/[id]/patch/route');
    const req = new Request('http://test/api/projects/p1/patch', { method: 'POST', body: JSON.stringify({ message: 'добавь страницу about' }) });
    const res = await POST(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(files['app/(app)/about/page.tsx']).toBeDefined();
    expect(spent).toBe(COSTS.patch);
    expect(patches.length).toBe(1);
    expect(projectStatus).toBe('ready');
  });
});
