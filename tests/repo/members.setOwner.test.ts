import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProjectRole } from '@prisma/client';

let project: { id: string; ownerId: string };
let members: Array<{ projectId: string; userId: string; role: ProjectRole }>;

const prisma = {
  project: {
    findUnique: vi.fn(async ({ where }: any) => {
      if (where.id !== project.id) return null;
      return { ownerId: project.ownerId };
    }),
    update: vi.fn(async ({ where, data }: any) => {
      if (where.id !== project.id) throw new Error('notfound');
      project.ownerId = data.ownerId;
      return { ...project };
    }),
  },
  projectMember: {
    findUnique: vi.fn(async ({ where }: any) => {
      return (
        members.find(
          (m) => m.projectId === where.projectId_userId.projectId && m.userId === where.projectId_userId.userId
        ) || null
      );
    }),
    update: vi.fn(async ({ where, data }: any) => {
      const m = members.find(
        (mm) => mm.projectId === where.projectId_userId.projectId && mm.userId === where.projectId_userId.userId
      );
      if (!m) throw new Error('notfound');
      Object.assign(m, data);
      return m;
    }),
    create: vi.fn(async ({ data }: any) => {
      members.push({ ...data });
      return data;
    }),
  },
  async $transaction(cb: any) {
    const snap = {
      project: { ...project },
      members: members.map((m) => ({ ...m })),
    };
    try {
      return await cb(prisma);
    } catch (e) {
      project = snap.project;
      members = snap.members;
      throw e;
    }
  },
};

vi.mock('@/lib/db', () => ({ prisma }));

const { setOwner } = await import('@/server/repo/members');

describe('setOwner', () => {
  beforeEach(() => {
    project = { id: 'p1', ownerId: 'u1' };
    members = [
      { projectId: 'p1', userId: 'u1', role: 'OWNER' as ProjectRole },
      { projectId: 'p1', userId: 'u2', role: 'COLLABORATOR' as ProjectRole },
    ];
    vi.clearAllMocks();
  });

  it('transfers ownership and updates roles', async () => {
    await setOwner('p1', 'u2');
    expect(project.ownerId).toBe('u2');
    const oldOwner = members.find((m) => m.userId === 'u1')!;
    const newOwner = members.find((m) => m.userId === 'u2')!;
    expect(oldOwner.role).toBe('MAINTAINER');
    expect(newOwner.role).toBe('OWNER');
  });

  it('adds new owner if not member', async () => {
    await setOwner('p1', 'u3');
    expect(project.ownerId).toBe('u3');
    const newOwner = members.find((m) => m.userId === 'u3');
    expect(newOwner?.role).toBe('OWNER');
    const prev = members.find((m) => m.userId === 'u1');
    expect(prev?.role).toBe('MAINTAINER');
  });

  it('rollback on error', async () => {
    // make update on new owner throw
    prisma.projectMember.update.mockImplementationOnce(async () => {
      throw new Error('fail');
    });
    await expect(setOwner('p1', 'u2')).rejects.toThrow('fail');
    expect(project.ownerId).toBe('u1');
    const u1 = members.find((m) => m.userId === 'u1')!;
    const u2 = members.find((m) => m.userId === 'u2')!;
    expect(u1.role).toBe('OWNER');
    expect(u2.role).toBe('COLLABORATOR');
  });
});
