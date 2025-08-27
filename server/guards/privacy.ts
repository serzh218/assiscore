import { prisma } from '@/lib/db';
import { isPro } from '@/server/repo/user';

export async function assertCanSetPrivate(userId: string) {
  const ok = await isPro(userId);
  if (!ok) {
    const err: any = new Error('Приватные проекты доступны на PRO');
    err.code = 'PRO_REQUIRED';
    throw err;
  }
}

export async function assertProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
  if (!project || project.ownerId !== userId) {
    const err: any = new Error('Forbidden');
    err.code = 'FORBIDDEN';
    throw err;
  }
}
