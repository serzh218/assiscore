import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { assertProjectOwnership } from '@/server/guards/privacy'
import { isPro } from '@/server/repo/user'
import { getProjectById, getProjectFiles, updateProjectArtifacts } from '@/server/repo/project'
import { deploySite } from '@/server/integrations/deploy'
import { enqueueDeployment, getDeployStatus } from '@/server/queue/deployQueue'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    await assertProjectOwnership(id, user.id)
    const pro = await isPro(user.id)
    if (!pro) {
      return NextResponse.json({ error: 'PRO required', code: 'PRO_REQUIRED' }, { status: 403 })
    }

    const { provider, domain } = await req.json()
    if (!provider) {
      return NextResponse.json({ error: 'provider required' }, { status: 400 })
    }

    const files = await getProjectFiles(id)
    if (!Object.keys(files).length) {
      return NextResponse.json({ error: 'Нечего публиковать' }, { status: 400 })
    }

    const project = await getProjectById(id)
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { deployUrl, providerProjectUrl, notes } = await deploySite({
      provider,
      domain,
      project: { id: project.id, title: project.title },
      files,
    })

    await updateProjectArtifacts(project.id, {
      deployProvider: provider,
      domain: domain ?? null,
      deployUrl,
      status: 'deploying',
    })

    enqueueDeployment(project.id, { provider, domain })

    return NextResponse.json({ ok: true, deployUrl, providerProjectUrl, notes })
  } catch (err: any) {
    if (err?.code === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('[deploy]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    const { searchParams } = new URL(req.url)
    const { id } = await params
    const projectId = id || searchParams.get('projectId') || ''

    const project = await getProjectById(projectId)
    if (!project) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (project.visibility !== 'public' && (!user || project.ownerId !== user.id)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const inMem = getDeployStatus(projectId)
    if (inMem) return NextResponse.json(inMem)

    return NextResponse.json({ stepStatus: 'done', logs: [] })
  } catch (err) {
    console.error('[deploy/status]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
