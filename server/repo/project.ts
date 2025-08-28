import { Prisma, type Project } from '@prisma/client'
import { prisma } from '@/lib/db'
import type { ProjectDTO, ProjectStatus, Visibility } from '@/types/domain'

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
  deployProvider: project.deployProvider ?? undefined,
  domain: project.domain ?? undefined,
  lastDeployedAt: project.lastDeployedAt ?? undefined,
  status: project.status,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
})

export async function createProject({
  ownerId,
  visibility,
  title,
  type,
  spec,
}: {
  ownerId: string
  visibility: Visibility
  title: string
  type: string
  spec: Prisma.JsonValue
}): Promise<ProjectDTO> {
  const project = await prisma.project.create({
    data: { ownerId, visibility, title, type, spec },
  })
  return toProjectDTO(project)
}

export async function getProjectById(id: string): Promise<ProjectDTO | null> {
  const project = await prisma.project.findUnique({ where: { id } })
  return project ? toProjectDTO(project) : null
}

export async function getProjectLight(
  id: string,
): Promise<{ id: string; ownerId: string; visibility: Visibility; title: string } | null> {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, ownerId: true, visibility: true, title: true },
  })
  return project
}

export async function listProjectsByOwner(
  ownerId: string,
  { limit = 20, cursor }: { limit?: number; cursor?: string },
): Promise<{ items: ProjectDTO[]; nextCursor: string | null }> {
  const projects = await prisma.project.findMany({
    where: { ownerId },
    orderBy: { updatedAt: 'desc' },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
  })
  const items = projects.slice(0, limit).map(toProjectDTO)
  const nextCursor = projects.length > limit ? projects[limit].id : null
  return { items, nextCursor }
}

export async function updateProjectSpec(
  id: string,
  spec: Prisma.JsonValue,
): Promise<ProjectDTO | null> {
  try {
    const project = await prisma.project.update({ where: { id }, data: { spec } })
    return toProjectDTO(project)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null
    }
    throw e
  }
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<ProjectDTO | null> {
  try {
    const project = await prisma.project.update({ where: { id }, data: { status } })
    return toProjectDTO(project)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null
    }
    throw e
  }
}

export async function updateProjectArtifacts(
  id: string,
  {
    files,
    previewUrl,
    repoUrl,
    deployUrl,
    deployProvider,
    domain,
    status,
    lastDeployedAt,
  }: {
    files?: Prisma.JsonValue
    previewUrl?: string
    repoUrl?: string
    deployUrl?: string
    deployProvider?: string | null
    domain?: string | null
    status?: ProjectStatus
    lastDeployedAt?: Date
  },
): Promise<ProjectDTO | null> {
  const data: Prisma.ProjectUpdateInput = {}
  if (files !== undefined) data.files = files
  if (previewUrl !== undefined) data.previewUrl = previewUrl
  if (repoUrl !== undefined) data.repoUrl = repoUrl
  if (deployUrl !== undefined) data.deployUrl = deployUrl
  if (deployProvider !== undefined) data.deployProvider = deployProvider
  if (domain !== undefined) data.domain = domain
  if (status !== undefined) data.status = status
  if (lastDeployedAt !== undefined) data.lastDeployedAt = lastDeployedAt

  try {
    const project = await prisma.project.update({ where: { id }, data })
    return toProjectDTO(project)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null
    }
    throw e
  }
}

export async function setProjectVisibility(
  id: string,
  visibility: Visibility,
): Promise<ProjectDTO | null> {
  try {
    const project = await prisma.project.update({ where: { id }, data: { visibility } })
    return toProjectDTO(project)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return null
    }
    throw e
  }
}

export async function getProjectFiles(id: string): Promise<Record<string, string>> {
  const project = await prisma.project.findUnique({ where: { id }, select: { files: true } })
  if (!project) {
    throw new Error('Project not found')
  }
  return (project.files as Record<string, string>) || {}
}

export async function setProjectFiles(id: string, files: Record<string, string>): Promise<void> {
  await prisma.project.update({ where: { id }, data: { files } })
}

export async function setForkUpstream(
  forkId: string,
  upstreamId: string,
  baseFiles: Record<string, string>,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id: forkId },
      data: { forkOfId: upstreamId, forkBase: baseFiles },
    })
    await tx.projectSnapshot.create({
      data: { projectId: forkId, label: 'fork-base', files: baseFiles },
    })
  })
}

export async function getUpstreamInfo(
  forkId: string,
): Promise<{
  upstreamId: string | null
  forkBase: Record<string, string> | null
  upstreamMergedAt: Date | null
}> {
  const proj = await prisma.project.findUnique({
    where: { id: forkId },
    select: { forkOfId: true, forkBase: true, upstreamMergedAt: true },
  })
  if (!proj) {
    throw new Error('Project not found')
  }
  return {
    upstreamId: proj.forkOfId ?? null,
    forkBase: (proj.forkBase as Record<string, string> | null) ?? null,
    upstreamMergedAt: proj.upstreamMergedAt ?? null,
  }
}

export async function markUpstreamMerged(id: string, date: Date): Promise<void> {
  await prisma.project.update({ where: { id }, data: { upstreamMergedAt: date } })
}

export async function touchProjectBuild(id: string, status: ProjectStatus): Promise<void> {
  await prisma.project.update({ where: { id }, data: { status } })
}

export async function listPublicProjects({
  limit = 20,
  offset = 0,
  orderBy = 'new',
}: {
  limit?: number
  offset?: number
  orderBy?: 'new' | 'popular'
} = {}): Promise<ProjectDTO[]> {
  const order: Prisma.Enumerable<Prisma.ProjectOrderByWithRelationInput> =
    orderBy === 'popular' ? [{ likes: 'desc' }, { createdAt: 'desc' }] : [{ createdAt: 'desc' }]
  const projects = await prisma.project.findMany({
    where: { visibility: 'public' },
    take: limit,
    skip: offset,
    orderBy: order,
  })
  return projects.map(toProjectDTO)
}

export async function forkProject({
  sourceProjectId,
  newOwnerId,
}: {
  sourceProjectId: string
  newOwnerId: string
}): Promise<ProjectDTO> {
  const source = await prisma.project.findUnique({ where: { id: sourceProjectId } })
  if (!source) {
    throw new Error('Source project not found')
  }
  const spec =
    typeof source.spec === 'object' && source.spec !== null
      ? { ...(source.spec as any), forkOf: sourceProjectId }
      : { forkOf: sourceProjectId }
  const project = await prisma.project.create({
    data: {
      ownerId: newOwnerId,
      visibility: 'public',
      title: source.title,
      type: source.type,
      spec,
      files: source.files ?? undefined,
      status: 'draft',
    },
  })
  return toProjectDTO(project)
}
