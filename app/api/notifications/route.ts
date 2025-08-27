import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { listNotifications } from '@/server/repo/notification'

export async function GET(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20', 10)
  const offset = parseInt(url.searchParams.get('offset') || '0', 10)
  const { items, total } = await listNotifications(user.id, { limit, offset })
  return NextResponse.json({ items, total })
}
