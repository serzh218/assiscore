import { Prisma, type Patch } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { PatchDTO } from '@/types/domain';

const toPatchDTO = (patch: Patch): PatchDTO => ({
  id: patch.id,
  projectId: patch.projectId,
  diff: patch.diff,
  costTokens: patch.costTokens,
  createdAt: patch.createdAt,
});

export async function createPatch({
  projectId,
  diff,
  costTokens,
}: {
  projectId: string;
  diff: string;
  costTokens: number;
}): Promise<PatchDTO> {
  const patch = await prisma.patch.create({
    data: { projectId, diff, costTokens },
  });
  return toPatchDTO(patch);
}

export async function listPatches(projectId: string): Promise<PatchDTO[]> {
  const patches = await prisma.patch.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
  return patches.map(toPatchDTO);
}
