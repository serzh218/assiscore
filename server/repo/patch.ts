import { Prisma, type Patch } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { PatchDTO } from '@/types/domain';

const toPatchDTO = (patch: Patch): PatchDTO => ({
  id: patch.id,
  projectId: patch.projectId,
  diff: patch.diff,
  status: patch.status,
  notes: patch.notes ?? undefined,
  costTokens: patch.costTokens,
  createdAt: patch.createdAt,
});

export async function createPatch({
  projectId,
  diff,
  status,
  notes,
  costTokens,
}: {
  projectId: string;
  diff: string;
  status: string;
  notes?: string;
  costTokens: number;
}): Promise<PatchDTO> {
  const patch = await prisma.patch.create({
    data: { projectId, diff, status: status as any, notes, costTokens },
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

export async function getPatchById(id: string): Promise<PatchDTO | null> {
  const patch = await prisma.patch.findUnique({ where: { id } });
  return patch ? toPatchDTO(patch) : null;
}

export async function deletePatch(id: string): Promise<void> {
  try {
    await prisma.patch.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return;
    }
    throw e;
  }
}
