import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { getPreferences, upsertPreferences } from '@/server/repo/notification'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const prefs = await getPreferences(user.id)
  return NextResponse.json(prefs)
}

export async function PATCH(req: Request) {
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
  const prefs = await upsertPreferences(user.id, body)
  return NextResponse.json(prefs)
}
