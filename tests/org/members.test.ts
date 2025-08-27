import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listMembers, addMember, updateRole, removeMember } from '@/server/repo/orgMembers';
import { OrgRole } from '@prisma/client';

let members: any[] = [];
const users: Record<string, { email: string; name?: string }> = {
  u1: { email: 'u1@example.com', name: 'User1' },
  u2: { email: 'u2@example.com', name: 'User2' },
};

vi.mock('@/lib/db', () => ({
  prisma: {
    orgMember: {
      findMany: vi.fn(async ({ where }: any) => {
        return members
          .filter((m) => m.orgId === where.orgId)
          .map((m) => ({ ...m, user: users[m.userId] }));
      }),
      create: vi.fn(async ({ data }: any) => {
        if (members.some((m) => m.orgId === data.orgId && m.userId === data.userId)) throw new Error('unique');
        const rec = { ...data, createdAt: new Date(), id: `m${members.length + 1}` };
        members.push(rec);
        return rec;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const rec = members.find((m) => m.orgId === where.orgId_userId.orgId && m.userId === where.orgId_userId.userId);
        Object.assign(rec, data);
        return rec;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = members.findIndex((m) => m.orgId === where.orgId_userId.orgId && m.userId === where.orgId_userId.userId);
        if (idx >= 0) members.splice(idx, 1);
      }),
    },
  },
}));

describe('org members repo', () => {
  beforeEach(() => {
    members = [];
  });

  it('add/update/remove member', async () => {
    await addMember('o1', 'u1', OrgRole.ADMIN);
    await addMember('o1', 'u2', OrgRole.VIEWER);
    let list = await listMembers('o1');
    expect(list).toHaveLength(2);
    await updateRole('o1', 'u2', OrgRole.MEMBER);
    list = await listMembers('o1');
    expect(list.find((m) => m.userId === 'u2')?.role).toBe(OrgRole.MEMBER);
    await removeMember('o1', 'u1');
    list = await listMembers('o1');
    expect(list).toHaveLength(1);
  });
});
