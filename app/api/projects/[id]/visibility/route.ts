import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { setProjectVisibility } from '@/server/repo/project'
import { assertCanSetPrivate, assertProjectOwnership } from '@/server/guards/privacy'
import { Visibility } from '@prisma/client'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const visibility = body.visibility as Visibility
  try {
    const { id } = await params
    await assertProjectOwnership(id, user.id)
    if (visibility === 'private') {
      await assertCanSetPrivate(user.id)
    }
    const project = await setProjectVisibility(id, visibility)
    return NextResponse.json({ ok: true, visibility: project?.visibility })
  } catch (e: any) {
    const code = e.code || 'ERROR'
    const status = code === 'PRO_REQUIRED' ? 403 : code === 'FORBIDDEN' ? 403 : 400
    return NextResponse.json({ error: e.message, code }, { status })
  }
}
