import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await prisma.user.update({
    where: { id: user.id },
    data: { githubLinked: false, githubUsername: null },
  })
  return NextResponse.json({ ok: true })
}
