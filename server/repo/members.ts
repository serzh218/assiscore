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

export async function getOwner(
  projectId: string
): Promise<{ userId: string } | null> {
  const rec = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  return rec ? { userId: rec.ownerId } : null;
}

export async function setOwner(
  projectId: string,
  newOwnerUserId: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const project = await tx.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    if (project.ownerId === newOwnerUserId) throw new Error('SAME_OWNER');

    const prevOwnerId = project.ownerId;

    // update project ownerId
    await tx.project.update({
      where: { id: projectId },
      data: { ownerId: newOwnerUserId },
    });

    // demote previous owner to maintainer
    const prevMember = await tx.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: prevOwnerId } },
      select: { id: true },
    });
    if (prevMember) {
      await tx.projectMember.update({
        where: { projectId_userId: { projectId, userId: prevOwnerId } },
        data: { role: 'MAINTAINER' },
      });
    } else {
      await tx.projectMember.create({
        data: {
          projectId,
          userId: prevOwnerId,
          role: 'MAINTAINER',
        },
      });
    }

    // promote/add new owner
    const newMember = await tx.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: newOwnerUserId } },
      select: { id: true },
    });
    if (newMember) {
      await tx.projectMember.update({
        where: { projectId_userId: { projectId, userId: newOwnerUserId } },
        data: { role: 'OWNER' },
      });
    } else {
      await tx.projectMember.create({
        data: { projectId, userId: newOwnerUserId, role: 'OWNER' },
      });
    }
  });
}

export async function addMember(projectId: string, userId: string, role: ProjectRole): Promise<void> {
  await prisma.projectMember.create({
    data: { projectId, userId, role },
  });
}

export async function updateMemberRole(projectId: string, userId: string, role: ProjectRole): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (project?.ownerId === userId) {
    throw new Error('CANNOT_UPDATE_OWNER');
  }
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

