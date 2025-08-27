import { NextResponse } from 'next/server';
import { listPublicProjects } from '@/server/repo/project';
import { prisma } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.max(parseInt(searchParams.get('limit') || '24', 10), 1);
  const order = (searchParams.get('order') === 'popular' ? 'popular' : 'new') as
    | 'new'
    | 'popular';
  const offset = (page - 1) * limit;

  const [projects, total] = await Promise.all([
    listPublicProjects({ limit, offset, orderBy: order }),
    prisma.project.count({ where: { visibility: 'public' } }),
  ]);

  const userIds = [...new Set(projects.map((p) => p.ownerId))];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return NextResponse.json({
    items: projects.map((p) => ({
      id: p.id,
      title: p.title,
      author: {
        id: p.ownerId,
        name: userMap.get(p.ownerId)?.name || userMap.get(p.ownerId)?.email || undefined,
      },
      previewUrl: p.previewUrl || undefined,
      createdAt: p.createdAt,
    })),
    total,
    page,
  });
}
