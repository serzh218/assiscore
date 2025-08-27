import { prisma } from '@/lib/db';

export type Permission =
  | 'project:read'
  | 'project:write'
  | 'project:share'
  | 'project:deploy'
  | 'project:export'
  | 'project:billing'
  | 'project:transfer'
  | 'project:settings';

export function resolvePermissions(
  role: 'OWNER' | 'MAINTAINER' | 'COLLABORATOR' | 'VIEWER'
) {
  switch (role) {
    case 'OWNER':
      return new Set<Permission>([
        'project:read',
        'project:write',
        'project:share',
        'project:deploy',
        'project:export',
        'project:billing',
        'project:transfer',
        'project:settings',
      ]);
    case 'MAINTAINER':
      return new Set<Permission>([
        'project:read',
        'project:write',
        'project:share',
        'project:deploy',
        'project:export',
        'project:settings',
      ]);
    case 'COLLABORATOR':
      return new Set<Permission>([
        'project:read',
        'project:write',
        'project:deploy',
        'project:export',
      ]);
    case 'VIEWER':
      return new Set<Permission>(['project:read']);
  }
}

export async function assertProjectPermission(
  projectId: string,
  userId: string | null,
  perm: Permission
): Promise<void> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, visibility: true },
  });
  if (!project) {
    const err: any = new Error('FORBIDDEN');
    err.code = 'FORBIDDEN';
    throw err;
  }

  if (userId === project.ownerId) {
    if (resolvePermissions('OWNER').has(perm)) return;
  } else if (userId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: { role: true },
    });
    if (member && resolvePermissions(member.role).has(perm)) return;
  } else if (project.visibility === 'public' && perm === 'project:read') {
    return;
  }

  const err: any = new Error('FORBIDDEN');
  err.code = 'FORBIDDEN';
  throw err;
}

export async function getProjectAccess(
  projectId: string,
  userId: string | null
): Promise<{
  role:
    | 'OWNER'
    | 'MAINTAINER'
    | 'COLLABORATOR'
    | 'VIEWER'
    | 'PUBLIC'
    | 'NONE';
  permissions: Set<Permission>;
}> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, visibility: true },
  });
  if (!project) {
    return { role: 'NONE', permissions: new Set() };
  }
  if (userId === project.ownerId) {
    return { role: 'OWNER', permissions: resolvePermissions('OWNER') };
  }
  if (userId) {
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: { role: true },
    });
    if (member) {
      return {
        role: member.role,
        permissions: resolvePermissions(member.role as any),
      } as any;
    }
  }
  if (project.visibility === 'public') {
    return { role: 'PUBLIC', permissions: new Set<Permission>(['project:read']) };
  }
  return { role: 'NONE', permissions: new Set() };
}

export function canTransferOwnership(role: 'OWNER' | 'MAINTAINER' | 'COLLABORATOR' | 'VIEWER') {
  return role === 'OWNER';
}

