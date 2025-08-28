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
  const cursor = url.searchParams.get('cursor') || undefined
  const { items, nextCursor, total } = await listNotifications(user.id, { limit, cursor })
  return NextResponse.json({ items, nextCursor, total })
}
