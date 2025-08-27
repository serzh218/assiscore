import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getProjectById } from '@/server/repo/project'
import { getPatchById, deletePatch } from '@/server/repo/patch'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; patchId: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, patchId } = await params
  const project = await getProjectById(id)
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const patch = await getPatchById(patchId)
  if (!patch || patch.projectId !== project.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({
    id: patch.id,
    status: patch.status,
    diff: patch.diff,
    notes: patch.notes ?? null,
    createdAt: patch.createdAt,
  })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; patchId: string }> },
) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, patchId } = await params
  const project = await getProjectById(id)
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const patch = await getPatchById(patchId)
  if (!patch || patch.projectId !== project.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  await deletePatch(patchId)
  return NextResponse.json({ ok: true })
}
