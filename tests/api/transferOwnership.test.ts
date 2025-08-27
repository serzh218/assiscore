import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectRole } from '@prisma/client';

let project: { id: string; ownerId: string };
let members: Array<{ projectId: string; userId: string; role: ProjectRole }>;

vi.mock('@/server/repo/members', () => ({
  setOwner: vi.fn(async (_pid: string, newOwnerId: string) => {
    if (newOwnerId === project.ownerId) throw new Error('SAME_OWNER');
    const prevOwnerId = project.ownerId;
    project.ownerId = newOwnerId;
    const prev = members.find((m) => m.userId === prevOwnerId);
    if (prev) prev.role = 'MAINTAINER';
    const existing = members.find((m) => m.userId === newOwnerId);
    if (existing) existing.role = 'OWNER';
    else members.push({ projectId: project.id, userId: newOwnerId, role: 'OWNER' });
  }),
}));

vi.mock('@/server/guards/acl', () => ({
  assertProjectPermission: vi.fn(async (pid: string, uid: string, perm: string) => {
    if (uid !== project.ownerId || perm !== 'project:transfer') {
      const err: any = new Error('FORBIDDEN');
      err.code = 'FORBIDDEN';
      throw err;
    }
  }),
}));

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: project.ownerId })),
}));

import { POST } from '@/app/api/projects/[id]/transfer-ownership/route';

describe('transfer ownership API', () => {
  beforeEach(() => {
    project = { id: 'p1', ownerId: 'u1' };
    members = [
      { projectId: 'p1', userId: 'u1', role: 'OWNER' as ProjectRole },
      { projectId: 'p1', userId: 'u2', role: 'COLLABORATOR' as ProjectRole },
    ];
    vi.clearAllMocks();
  });

  it('owner transfers to collaborator', async () => {
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ newOwnerUserId: 'u2', confirm: true }),
      }),
      { params: { id: 'p1' } }
    );
    expect(res.status).toBe(200);
    expect(project.ownerId).toBe('u2');
    const old = members.find((m) => m.userId === 'u1')!;
    expect(old.role).toBe('MAINTAINER');
  });

  it('cannot transfer to self', async () => {
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ newOwnerUserId: 'u1', confirm: true }),
      }),
      { params: { id: 'p1' } }
    );
    expect(res.status).toBe(400);
  });

  it('non-owner forbidden', async () => {
    const auth = await import('@/lib/auth');
    (auth.getCurrentUser as any).mockResolvedValue({ id: 'u2' });
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ newOwnerUserId: 'u3', confirm: true }),
      }),
      { params: { id: 'p1' } }
    );
    expect(res.status).toBe(403);
  });

  it('maintainer cannot transfer', async () => {
    members.push({ projectId: 'p1', userId: 'u3', role: 'MAINTAINER' as ProjectRole });
    const auth = await import('@/lib/auth');
    (auth.getCurrentUser as any).mockResolvedValue({ id: 'u3' });
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ newOwnerUserId: 'u2', confirm: true }),
      }),
      { params: { id: 'p1' } }
    );
    expect(res.status).toBe(403);
  });
});
