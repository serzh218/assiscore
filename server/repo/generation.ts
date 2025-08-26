import { Prisma, type Generation } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { GenerationDTO } from '@/types/domain';

const toGenerationDTO = (gen: Generation): GenerationDTO => ({
  id: gen.id,
  projectId: gen.projectId,
  costTokens: gen.costTokens,
  logs: gen.logs,
  createdAt: gen.createdAt,
});

export async function createGeneration({
  projectId,
  costTokens,
  logs,
}: {
  projectId: string;
  costTokens: number;
  logs: string;
}): Promise<GenerationDTO> {
  const gen = await prisma.generation.create({
    data: { projectId, costTokens, logs },
  });
  return toGenerationDTO(gen);
}

export async function appendGenerationLogs(id: string, chunk: string): Promise<GenerationDTO | null> {
  const existing = await prisma.generation.findUnique({ where: { id }, select: { logs: true } });
  if (!existing) return null;
  const gen = await prisma.generation.update({
    where: { id },
    data: { logs: existing.logs + chunk },
  });
  return toGenerationDTO(gen);
}

export async function listGenerations(projectId: string): Promise<GenerationDTO[]> {
  const gens = await prisma.generation.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
  return gens.map(toGenerationDTO);
}
