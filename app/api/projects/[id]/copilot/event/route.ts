import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { assertProjectPermission } from '@/server/guards/acl'
import { logCopilotEvent } from '@/server/repo/copilot'

interface EventBody {
  filePath: string
  action: string
  text: string
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await assertProjectPermission(id, user.id, 'project:read')

    const body: EventBody = await req.json()
    await logCopilotEvent({
      userId: user.id,
      projectId: id,
      filePath: body.filePath,
      action: body.action,
      text: body.text,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[copilot/event]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
