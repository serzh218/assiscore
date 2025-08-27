import { randomUUID, randomBytes } from 'crypto';
import { prisma } from '@/lib/db';
import type { ProjectRole } from '@prisma/client';

export async function createInvite({
  projectId,
  email,
  role,
  invitedBy,
  ttlHours = 72,
}: {
  projectId: string;
  email: string;
  role: ProjectRole;
  invitedBy: string;
  ttlHours?: number;
}): Promise<{ id: string; token: string; expiresAt: Date }> {
  const token = `${randomUUID()}-${randomBytes(8).toString('hex')}`;
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);
  const rec = await prisma.projectInvite.create({
    data: {
      projectId,
      email: email.trim().toLowerCase(),
      role,
      token,
      expiresAt,
      invitedBy,
    },
  });
  return { id: rec.id, token: rec.token, expiresAt: rec.expiresAt };
}

export async function getInviteByToken(token: string) {
  return prisma.projectInvite.findUnique({ where: { token } });
}

export async function markInviteUsed(id: string): Promise<void> {
  await prisma.projectInvite.update({
    where: { id },
    data: { usedAt: new Date() },
  });
}

export async function listInvites(
  projectId: string
): Promise<Array<{ id: string; email: string; role: ProjectRole; expiresAt: Date; usedAt?: Date | null }>> {
  const arr = await prisma.projectInvite.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
  });
  return arr.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    expiresAt: i.expiresAt,
    usedAt: i.usedAt ?? null,
  }));
}

export async function cancelInvite(id: string): Promise<void> {
  await prisma.projectInvite.update({
    where: { id },
    data: { expiresAt: new Date() },
  });
}

