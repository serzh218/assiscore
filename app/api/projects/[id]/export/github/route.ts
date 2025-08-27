import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { getProjectById, getProjectFiles, updateProjectArtifacts } from '@/server/repo/project'
import { createRepo, pushFiles } from '@/server/integrations/github'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.plan !== 'PRO') {
    return NextResponse.json({ error: 'PRO required', code: 'PRO_REQUIRED' }, { status: 403 })
  }
  if (!user.githubLinked) {
    return NextResponse.json(
      { error: 'GitHub not linked', code: 'GITHUB_NOT_LINKED' },
      { status: 400 },
    )
  }
  const { id } = await params
  const project = await getProjectById(id)
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
  }
  const body = await req.json()
  const visibility = body.visibility as 'public' | 'private'
  const files = await getProjectFiles(id)
  const { repoUrl } = await createRepo(user, { project, visibility })
  await pushFiles(repoUrl, files)
  await updateProjectArtifacts(id, { repoUrl })
  return NextResponse.json({ ok: true, repoUrl })
}
