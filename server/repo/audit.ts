import { prisma } from '@/lib/db';

export async function writeAudit(
  projectId: string,
  userId: string,
  action: string,
  meta?: any
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: { projectId, userId, action, meta },
    });
  } catch {
    // swallow errors – audit should not block main flow
  }
}

