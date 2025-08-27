import { describe, it, expect, vi, beforeEach } from 'vitest';

let files: Record<string, string> = { 'app/code.ts': 'const a=1;' };

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}));

vi.mock('@/server/repo/project', () => ({
  getProjectById: vi.fn(async () => ({ id: 'p1' })),
  getProjectFiles: vi.fn(async () => files),
  setProjectFiles: vi.fn(async (_id: string, f: any) => { files = f; }),
  touchProjectBuild: vi.fn(async () => {}),
}));

vi.mock('@/server/repo/patch', () => ({
  createPatch: vi.fn(async (data: any) => ({ id: 'patch1', ...data })),
}));

vi.mock('@/server/ai/context', () => ({
  makeCodeContext: vi.fn(async () => ({})),
}));

describe('assistant API', () => {
  beforeEach(() => {
    files = { 'app/code.ts': 'const a=1;' };
  });

  it('explains code without patch', async () => {
    const { POST } = await import('@/app/api/projects/[id]/assistant/route');
    const body = { action: 'explain', filePath: 'app/code.ts', selection: { start: 0, end: 0, content: 'const a=1;' } };
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify(body) }), { params: { id: 'p1' } } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('text');
    expect(files['app/code.ts']).toBe('const a=1;');
  });

  it('refactors code and creates patch', async () => {
    const { POST } = await import('@/app/api/projects/[id]/assistant/route');
    const body = { action: 'refactor', filePath: 'app/code.ts', selection: { start: 0, end: 0, content: 'const a=1;' } };
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify(body) }), { params: { id: 'p1' } } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('diff');
    expect(data.patchId).toBeDefined();
    expect(files['app/code.ts']).toContain('refactored');
  });
});
