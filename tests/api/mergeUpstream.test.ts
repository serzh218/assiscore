import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}));

const projectRepo = {
  getProjectLight: vi.fn(async (id: string) => {
    if (id === 'fork') return { id: 'fork', ownerId: 'u1', visibility: 'public', title: '' };
    if (id === 'up') return { id: 'up', ownerId: 'u2', visibility: 'public', title: '' };
    return null;
  }),
  getProjectFiles: vi.fn(async (id: string) => ({ 'index.html': id })),
  setForkUpstream: vi.fn(async () => {}),
};

vi.mock('@/server/repo/project', () => projectRepo);

vi.mock('@/server/merge/orchestrator', () => ({
  mergeUpstream: vi.fn(async () => ({ ok: true, changed: ['index.html'] })),
}));

describe('upstream API', () => {
  it('sets upstream', async () => {
    const { POST } = await import('@/app/api/projects/[id]/upstream/set/route');
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({ upstreamId: 'up' }) }), {
      params: { id: 'fork' },
    });
    expect(res.status).toBe(200);
    expect(projectRepo.setForkUpstream).toHaveBeenCalled();
  });

  it('merges upstream cleanly', async () => {
    const { POST } = await import('@/app/api/projects/[id]/upstream/merge/route');
    const res = await POST(new Request('http://test', { method: 'POST' }), { params: { id: 'fork' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });

  it('handles merge conflicts', async () => {
    const orchestrator = await import('@/server/merge/orchestrator');
    (orchestrator.mergeUpstream as any).mockResolvedValueOnce({ ok: false, conflicts: [{ path: 'a' }], changed: [] });
    const { POST } = await import('@/app/api/projects/[id]/upstream/merge/route');
    const res = await POST(new Request('http://test', { method: 'POST' }), { params: { id: 'fork' } });
    const data = await res.json();
    expect(data.ok).toBe(false);
    expect(data.conflicts.length).toBe(1);
  });
});
