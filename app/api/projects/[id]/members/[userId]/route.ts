import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { assertProjectPermission, getProjectAccess } from '@/server/guards/acl'
import { updateMemberRole, getRole } from '@/server/repo/members'
import { writeAudit } from '@/server/repo/audit'
import type { ProjectRole } from '@prisma/client'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, userId } = await params

  try {
    await assertProjectPermission(id, user.id, 'project:share')
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const access = await getProjectAccess(id, user.id)
  const body = await req.json()
  const role = body.role as ProjectRole
  if (!role) return NextResponse.json({ error: 'role required' }, { status: 400 })

  if (access.role === 'MAINTAINER') {
    if (role === 'OWNER' || role === 'MAINTAINER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  if (access.role === 'OWNER') {
    if (role === 'OWNER') {
      return NextResponse.json({ error: 'Use transfer endpoint' }, { status: 400 })
    }
  }

  const prev = await getRole(id, userId)
  try {
    await updateMemberRole(id, userId, role)
    await writeAudit(id, user.id, 'role.update', {
      userId,
      from: prev,
      to: role,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    if (err.message === 'CANNOT_UPDATE_OWNER') {
      return NextResponse.json({ error: 'Cannot modify owner' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Conflict' }, { status: 409 })
  }
}
