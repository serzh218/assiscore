import { prisma } from '@/lib/db'

export async function assertProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })
  if (!project || project.ownerId !== userId) {
    const err: any = new Error('Forbidden')
    err.code = 'FORBIDDEN'
    throw err
  }
}
