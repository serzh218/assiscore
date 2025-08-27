import { describe, it, expect, beforeEach, vi } from 'vitest';
import { COSTS } from '@/lib/limits';

let files: Record<string, string> = { 'index.html': '<h1>Hi</h1>\n' };
let patches: any[] = [];

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1', tokens: 100 }))
}));

vi.mock('@/server/repo/project', () => ({
  getProjectById: vi.fn(async () => ({ id: 'p1', ownerId: 'u1', visibility: 'public', title: 'Test', type: 'site', spec: {}, status: 'ready', createdAt: new Date() })),
  getProjectFiles: vi.fn(async () => files),
  setProjectFiles: vi.fn(async (_id: string, f: Record<string, string>) => { files = f; }),
  touchProjectBuild: vi.fn(async () => {}),
}));

vi.mock('@/server/repo/patch', () => ({
  createPatch: vi.fn(async (data: any) => { patches.push(data); return { id: 'patch1', projectId: data.projectId, diff: data.diff, notes: data.notes, status: data.status, costTokens: data.costTokens, createdAt: new Date() }; }),
}));

vi.mock('@/lib/ai/llm', () => ({
  generateDiffBundle: vi.fn(async () => ({
    diffs: [
      { path: 'index.html', diff: '--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-<h1>Hi</h1>\n+<h1>Hello</h1>\n' },
    ],
    notes: 'ok',
  })),
}));

vi.mock('@/server/guards/limits', () => ({
  spendTokens: vi.fn(async () => {}),
}));

vi.mock('@/server/queue/generationQueue', () => ({
  enqueueRebuild: vi.fn(async () => {}),
}));

describe('patch pipeline API', () => {
  beforeEach(() => {
    files = { 'index.html': '<h1>Hi</h1>\n' };
    patches = [];
  });

  it('applies diff and stores patch', async () => {
    const { POST } = await import('@/app/api/projects/[id]/patch/route');
    const req = new Request('http://test/api/projects/p1/patch', { method: 'POST', body: JSON.stringify({ message: 'upd' }) });
    const res = await POST(req, { params: { id: 'p1' } });
    expect(res.status).toBe(200);
    expect(files['index.html']).toContain('Hello');
    expect(patches[0].status).toBe('ready');
    expect(JSON.parse(patches[0].diff)[0].path).toBe('index.html');
    expect(patches[0].costTokens).toBe(COSTS.patch);
  });
});
