import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { COSTS } from '@/lib/limits'
import { getProjectById } from '@/server/repo/project'
import { runPatchPipeline } from '@/server/ai/patchOrchestrator'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const project = await getProjectById(id)
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { message } = await req.json()
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }
  if (user.tokens < COSTS.patch) {
    return NextResponse.json({ error: 'Недостаточно токенов' }, { status: 402 })
  }
  try {
    const patchId = await runPatchPipeline({ user, project, message })
    return NextResponse.json({ ok: true, patchId })
  } catch (e: any) {
    if (e instanceof Error && e.message === 'INVALID_DIFF') {
      return NextResponse.json({ error: 'Invalid diff' }, { status: 400 })
    }
    if (e instanceof Error && e.message === 'FILE_NOT_FOUND') {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
    if (e instanceof Error && e.message === 'PATCH_TOO_LARGE') {
      return NextResponse.json({ error: 'Patch too large' }, { status: 413 })
    }
    console.error('[patch]', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
