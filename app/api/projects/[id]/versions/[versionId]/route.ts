import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { getProjectById } from '@/server/repo/project'
import { getVersion } from '@/server/repo/version'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; versionId: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id: projectId, versionId } = await params
  const project = await getProjectById(projectId)
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const version = await getVersion(versionId)
  if (!version || version.projectId !== project.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { id: vId, label, createdAt, files } = version
  return NextResponse.json({ id: vId, label, createdAt, files })
}
