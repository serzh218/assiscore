import type { OrgRole } from '@prisma/client';

import { prisma } from '@/lib/db';

export type OrgPermission =
  | 'org:read'
  | 'org:manage'
  | 'org:billing'
  | 'org:members'
  | 'org:projects';

export function resolveOrgPermissions(role: OrgRole) {
  switch (role) {
    case 'OWNER':
      return new Set<OrgPermission>([
        'org:read',
        'org:manage',
        'org:billing',
        'org:members',
        'org:projects',
      ]);
    case 'ADMIN':
      return new Set<OrgPermission>([
        'org:read',
        'org:manage',
        'org:members',
        'org:projects',
      ]);
    case 'MEMBER':
      return new Set<OrgPermission>(['org:read', 'org:projects']);
    case 'VIEWER':
      return new Set<OrgPermission>(['org:read']);
  }
}

export async function assertOrgPermission(
  orgId: string,
  userId: string,
  perm: OrgPermission
): Promise<void> {
  const member = await prisma.orgMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
    select: { role: true },
  });
  if (member && resolveOrgPermissions(member.role).has(perm)) return;
  const err: any = new Error('FORBIDDEN');
  err.code = 'FORBIDDEN';
  throw err;
}
