import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { assertProjectPermission } from '@/server/guards/acl'
import { setOwner } from '@/server/repo/members'
import { writeAudit } from '@/server/repo/audit'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    await assertProjectPermission(id, user.id, 'project:transfer')
  } catch (e: any) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { newOwnerUserId, confirm } = body as {
    newOwnerUserId: string
    confirm: boolean
  }
  if (!confirm) {
    return NextResponse.json({ error: 'Confirmation required' }, { status: 400 })
  }
  if (!newOwnerUserId) {
    return NextResponse.json({ error: 'newOwnerUserId required' }, { status: 400 })
  }
  try {
    await setOwner(id, newOwnerUserId)
    await writeAudit(id, user.id, 'owner.transfer', {
      from: user.id,
      to: newOwnerUserId,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === 'SAME_OWNER') {
      return NextResponse.json({ error: 'Cannot transfer to self' }, { status: 400 })
    }
    if (err.message === 'PROJECT_NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Conflict' }, { status: 409 })
  }
}
