import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { setProjectVisibility } from '@/server/repo/project'
import { assertProjectOwnership } from '@/server/guards/privacy'
import { assertEntitlements, PaywallError } from '@/server/guards/entitlements'
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
      await assertEntitlements(user, 'privateProjects')
    }
    const project = await setProjectVisibility(id, visibility)
    return NextResponse.json({ ok: true, visibility: project?.visibility })
  } catch (e: any) {
    if (e instanceof PaywallError) {
      return NextResponse.json({ error: e.message, code: 'PAYWALL' }, { status: 402 })
    }
    const code = e.code || 'ERROR'
    const status = code === 'FORBIDDEN' ? 403 : 400
    return NextResponse.json({ error: e.message, code }, { status })
  }
}
