import type { OrgRole } from '@prisma/client';

import { prisma } from '@/lib/db';

export async function listMembers(orgId: string) {
  const members = await prisma.orgMember.findMany({
    where: { orgId },
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

export async function addMember(orgId: string, userId: string, role: OrgRole) {
  await prisma.orgMember.create({ data: { orgId, userId, role } });
}

export async function updateRole(orgId: string, userId: string, role: OrgRole) {
  await prisma.orgMember.update({
    where: { orgId_userId: { orgId, userId } },
    data: { role },
  });
}

export async function removeMember(orgId: string, userId: string) {
  await prisma.orgMember.delete({ where: { orgId_userId: { orgId, userId } } });
}
