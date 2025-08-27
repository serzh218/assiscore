import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { markAllRead, markRead } from '@/server/repo/notification'

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  let body: any = {}
  try {
    body = await req.json()
  } catch {
    // ignore
  }
  if (Array.isArray(body.ids) && body.ids.length) {
    await markRead(user.id, body.ids)
  } else {
    await markAllRead(user.id)
  }
  return NextResponse.json({ ok: true })
}
