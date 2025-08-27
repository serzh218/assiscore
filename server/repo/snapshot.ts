import { prisma } from '@/lib/db';

export async function saveSnapshot(projectId: string, label: string, files: Record<string, string>): Promise<void> {
  await prisma.projectSnapshot.create({ data: { projectId, label, files } });
}
