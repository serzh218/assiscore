import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOrg, listUserOrgs, getOrgBySlug, updateOrg, deleteOrg } from '@/server/repo/org';

var orgs: any[] = [];
var members: any[] = [];

vi.mock('@/lib/db', () => {
  const prisma: any = {
    organization: {
      create: vi.fn(async ({ data }: any) => {
        const org = { ...data, id: `o${orgs.length + 1}`, createdAt: new Date(), updatedAt: new Date() };
        orgs.push(org);
        return org;
      }),
      findMany: vi.fn(async () => orgs),
      findUnique: vi.fn(async ({ where }: any) => {
        return orgs.find((o) => o.slug === where.slug || o.id === where.id) || null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const org = orgs.find((o) => o.id === where.id);
        Object.assign(org, data);
        return org;
      }),
      delete: vi.fn(async ({ where }: any) => {
        orgs = orgs.filter((o) => o.id !== where.id);
      }),
    },
    orgMember: {
      create: vi.fn(async ({ data }: any) => {
        const rec = { ...data, id: `m${members.length + 1}`, createdAt: new Date() };
        members.push(rec);
        return rec;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return members
          .filter((m) => m.userId === where.userId)
          .map((m) => ({ ...m, org: orgs.find((o) => o.id === m.orgId)! }));
      }),
    },
  };
  prisma.$transaction = async (cb: any) => cb(prisma);
  return { prisma };
});

describe('org repo', () => {
  beforeEach(() => {
    orgs = [];
    members = [];
  });

  it('create/list/update/delete', async () => {
    const org = await createOrg('Org1', 'org1', 'u1');
    expect(orgs).toHaveLength(1);
    expect(members).toHaveLength(1);
    expect((await listUserOrgs('u1')).length).toBe(1);
    expect((await getOrgBySlug('org1'))?.name).toBe('Org1');
    await updateOrg(org.id, { name: 'Org2' });
    expect(orgs[0].name).toBe('Org2');
    await deleteOrg(org.id);
    expect(orgs).toHaveLength(0);
  });
});
