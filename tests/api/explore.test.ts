import { describe, it, expect, vi, beforeEach } from 'vitest';

const projects = [
  { id: 'p1', ownerId: 'u1', visibility: 'public', title: 'P1', type: 't', spec: {}, createdAt: new Date() },
  { id: 'p2', ownerId: 'u2', visibility: 'public', title: 'P2', type: 't', spec: {}, createdAt: new Date() },
];

vi.mock('@/server/repo/project', () => ({
  listPublicProjects: vi.fn(async ({ limit, offset }: any) => projects.slice(offset, offset + limit)),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    project: { count: vi.fn(async () => projects.length) },
    user: {
      findMany: vi.fn(async ({ where }: any) => where.id.in.map((id: string) => ({ id, name: `User ${id}`, email: `${id}@test` }))),
    },
  },
}));

describe('explore API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns public projects', async () => {
    const { GET } = await import('@/app/api/explore/route');
    const res = await GET(new Request('http://test/api/explore?order=new&limit=10&page=1'));
    const data = await res.json();
    expect(data.items.length).toBe(2);
    expect(data.total).toBe(2);
  });

  it('returns empty on high page', async () => {
    const { GET } = await import('@/app/api/explore/route');
    const res = await GET(new Request('http://test/api/explore?page=10&limit=10'));
    const data = await res.json();
    expect(data.items.length).toBe(0);
  });
});
