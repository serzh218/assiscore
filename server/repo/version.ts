import { prisma } from '@/lib/db';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VERSIONS = 20;

export async function saveVersion(
  projectId: string,
  userId: string,
  label: string,
  files: Record<string, string>,
): Promise<string> {
  const size = Buffer.byteLength(JSON.stringify(files), 'utf8');
  if (size > MAX_SIZE) {
    throw new Error('VERSION_TOO_LARGE');
  }
  const version = await prisma.projectVersion.create({
    data: { projectId, createdBy: userId, label, files },
  });
  const versions = await prisma.projectVersion.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    skip: MAX_VERSIONS,
  });
  if (versions.length > 0) {
    await prisma.projectVersion.deleteMany({
      where: { id: { in: versions.map((v) => v.id) } },
    });
  }
  return version.id;
}

export async function listVersions(
  projectId: string,
  limit = 20,
  offset = 0,
): Promise<{ id: string; label: string; createdAt: Date }[]> {
  const versions = await prisma.projectVersion.findMany({
    where: { projectId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: { id: true, label: true, createdAt: true },
  });
  return versions;
}

export async function getVersion(id: string) {
  return prisma.projectVersion.findUnique({ where: { id } });
}
