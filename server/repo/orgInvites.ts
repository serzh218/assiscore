import { randomUUID, randomBytes } from 'crypto';

import type { OrgRole } from '@prisma/client';

import { prisma } from '@/lib/db';

export async function createInvite(
  orgId: string,
  email: string,
  role: OrgRole,
  invitedBy: string,
  ttlHours = 72
) {
  const token = `${randomUUID()}-${randomBytes(8).toString('hex')}`;
  const expiresAt = new Date(Date.now() + ttlHours * 3600 * 1000);
  const rec = await prisma.orgInvite.create({
    data: {
      orgId,
      email: email.trim().toLowerCase(),
      role,
      token,
      expiresAt,
      invitedBy,
    },
  });
  return { id: rec.id, token: rec.token, expiresAt: rec.expiresAt };
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await prisma.orgInvite.findUnique({ where: { token } });
  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    throw new Error('INVITE_INVALID');
  }
  await prisma.$transaction(async (tx) => {
    await tx.orgMember.create({
      data: { orgId: invite.orgId, userId, role: invite.role },
    });
    await tx.orgInvite.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    });
  });
  return invite.orgId;
}

export async function listInvites(orgId: string) {
  const arr = await prisma.orgInvite.findMany({
    where: { orgId },
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

export async function cancelInvite(inviteId: string) {
  await prisma.orgInvite.update({
    where: { id: inviteId },
    data: { expiresAt: new Date() },
  });
}
