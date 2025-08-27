import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getProjectById, forkProject } from '@/server/repo/project'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const project = await getProjectById(id)
  if (!project || project.visibility !== 'public') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const forked = await forkProject({ sourceProjectId: id, newOwnerId: user.id })
  return NextResponse.json({ projectId: forked.id })
}
