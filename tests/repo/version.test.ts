import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveVersion, listVersions } from '@/server/repo/version';

let records: any[] = [];

vi.mock('@/lib/db', () => ({
  prisma: {
    projectVersion: {
      create: async ({ data }: any) => {
        const rec = { ...data, id: `v${records.length + 1}`, createdAt: new Date() };
        records.push(rec);
        return rec;
      },
      findMany: async ({ where, orderBy, take, skip, select }: any) => {
        let arr = records.filter((r) => r.projectId === where.projectId);
        arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (skip) arr = arr.slice(skip);
        if (take) arr = arr.slice(0, take);
        if (select) {
          return arr.map((r) => ({ id: r.id, label: r.label, createdAt: r.createdAt }));
        }
        return arr;
      },
      deleteMany: async ({ where }: any) => {
        records = records.filter((r) => !where.id.in.includes(r.id));
      },
    },
  },
}));

describe('project versions repo', () => {
  beforeEach(() => {
    records = [];
  });

  it('saveVersion creates record', async () => {
    const id = await saveVersion('p1', 'u1', 'gen', { a: '1' });
    expect(records.length).toBe(1);
    expect(records[0].label).toBe('gen');
    expect(id).toBe(records[0].id);
  });

  it('listVersions returns by order', async () => {
    await saveVersion('p1', 'u1', 'v1', {});
    await new Promise((r) => setTimeout(r, 10));
    await saveVersion('p1', 'u1', 'v2', {});
    const list = await listVersions('p1');
    expect(list[0].label).toBe('v2');
    expect(list[1].label).toBe('v1');
  });
});
