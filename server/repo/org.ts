import type { Plan } from '@prisma/client';

import { prisma } from '@/lib/db';

export async function createOrg(name: string, slug: string, ownerUserId: string) {
  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name, slug, plan: 'FREE' as Plan },
    });
    await tx.orgMember.create({
      data: { orgId: org.id, userId: ownerUserId, role: 'OWNER' },
    });
    return org;
  });
}

export async function listUserOrgs(userId: string) {
  const members = await prisma.orgMember.findMany({
    where: { userId },
    include: { org: true },
    orderBy: { createdAt: 'asc' },
  });
  return members.map((m) => m.org);
}

export async function getOrgBySlug(slug: string) {
  return prisma.organization.findUnique({ where: { slug } });
}

export async function updateOrg(orgId: string, patch: { name?: string; slug?: string; plan?: Plan; tokens?: number }) {
  return prisma.organization.update({
    where: { id: orgId },
    data: patch,
  });
}

export async function deleteOrg(orgId: string) {
  await prisma.organization.delete({ where: { id: orgId } });
}
