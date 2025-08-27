import { prisma } from '@/lib/db';
import type { ProjectRole } from '@prisma/client';

export async function listMembers(
  projectId: string
): Promise<Array<{ userId: string; email: string; name?: string | null; role: ProjectRole; createdAt: Date }>> {
  const members = await prisma.projectMember.findMany({
    where: { projectId },
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });
  return members.map((m) => ({
    userId: m.userId,
    email: m.user.email!,
    name: m.user.name ?? null,
    role: m.role,
    createdAt: m.createdAt,
  }));
}

export async function getRole(projectId: string, userId: string): Promise<ProjectRole | null> {
  const rec = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { role: true },
  });
  return rec?.role ?? null;
}

export async function addMember(projectId: string, userId: string, role: ProjectRole): Promise<void> {
  await prisma.projectMember.create({
    data: { projectId, userId, role },
  });
}

export async function updateMemberRole(projectId: string, userId: string, role: ProjectRole): Promise<void> {
  await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
  });
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  await prisma.projectMember.delete({
    where: { projectId_userId: { projectId, userId } },
  });
}

