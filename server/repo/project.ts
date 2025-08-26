import { Prisma, type Project } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { ProjectDTO, ProjectStatus, Visibility } from '@/types/domain';

const toProjectDTO = (project: Project): ProjectDTO => ({
  id: project.id,
  ownerId: project.ownerId,
  visibility: project.visibility,
  title: project.title,
  type: project.type,
  spec: project.spec,
  files: project.files ?? undefined,
  previewUrl: project.previewUrl ?? undefined,
  repoUrl: project.repoUrl ?? undefined,
  deployUrl: project.deployUrl ?? undefined,
  status: project.status,
  createdAt: project.createdAt,
});

export async function createProject({
  ownerId,
  visibility,
  title,
  type,
  spec,
}: {
  ownerId: string;
  visibility: Visibility;
  title: string;
  type: string;
  spec: Prisma.JsonValue;
}): Promise<ProjectDTO> {
  const project = await prisma.project.create({
    data: { ownerId, visibility, title, type, spec },
  });
  return toProjectDTO(project);
}

export async function getProjectById(id: string): Promise<ProjectDTO | null> {
  const project = await prisma.project.findUnique({ where: { id } });
  return project ? toProjectDTO(project) : null;
}

export async function listProjectsByOwner(
  ownerId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number }
): Promise<ProjectDTO[]> {
  const projects = await prisma.project.findMany({
    where: { ownerId },
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });
  return projects.map(toProjectDTO);
}

export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<ProjectDTO | null> {
  try {
    const project = await prisma.project.update({ where: { id }, data: { status } });
    return toProjectDTO(project);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null;
    }
    throw e;
  }
}

export async function updateProjectArtifacts(
  id: string,
  {
    files,
    previewUrl,
    repoUrl,
    deployUrl,
  }: { files?: Prisma.JsonValue; previewUrl?: string; repoUrl?: string; deployUrl?: string }
): Promise<ProjectDTO | null> {
  const data: Prisma.ProjectUpdateInput = {};
  if (files !== undefined) data.files = files;
  if (previewUrl !== undefined) data.previewUrl = previewUrl;
  if (repoUrl !== undefined) data.repoUrl = repoUrl;
  if (deployUrl !== undefined) data.deployUrl = deployUrl;

  try {
    const project = await prisma.project.update({ where: { id }, data });
    return toProjectDTO(project);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null;
    }
    throw e;
  }
}

export async function setProjectVisibility(id: string, visibility: Visibility): Promise<ProjectDTO | null> {
  try {
    const project = await prisma.project.update({ where: { id }, data: { visibility } });
    return toProjectDTO(project);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null;
    }
    throw e;
  }
}
