import { getCurrentUser } from '@/auth'
import { prisma } from '@/lib/db'
import { ask, explainCode, refactor, writeTests } from '@/server/ai/skills'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(req.url)
  const limit = parseInt(url.searchParams.get('limit') || '20', 10)
  const cursor = url.searchParams.get('cursor')
  const records = await prisma.chatMessage.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    cursor: cursor ? { id: cursor } : undefined,
    select: { id: true, role: true, content: true, createdAt: true },
  })
  const messages = records
    .slice(0, limit)
    .reverse()
    .map(({ id: _id, ...rest }) => rest)
  const nextCursor = records.length > limit ? records[limit].id : null
  return Response.json({ messages, nextCursor })
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return new Response('Unauthorized', { status: 401 })
  const { id } = await params
  const body = await req.json()
  const mode = body.mode || 'default'
  const message = String(body.message || '')

  if (mode !== 'default') {
    await prisma.chatMessage.create({
      data: {
        projectId: id,
        userId: user.id,
        role: 'system',
        content: `mode=${mode}`,
      },
    })
  }

  await prisma.chatMessage.create({
    data: {
      projectId: id,
      userId: user.id,
      role: 'user',
      content: message,
    },
  })

  let answer = ''
  if (mode === 'explain') {
    const res = await explainCode({ selection: { start: 0, end: 0, content: message } })
    answer = res.text
  } else if (mode === 'refactor') {
    const res = await refactor({
      filePath: 'file.ts',
      selection: { start: 0, end: 0, content: message },
    })
    answer = res.diff
  } else if (mode === 'tests') {
    const res = await writeTests({ filePath: message })
    answer = res.diff
  } else {
    const res = await ask({ question: message })
    answer = res.text
  }

  await prisma.chatMessage.create({
    data: {
      projectId: id,
      userId: user.id,
      role: 'assistant',
      content: answer,
    },
  })

  const messages = await prisma.chatMessage.findMany({
    where: { projectId: id },
    orderBy: { createdAt: 'asc' },
    select: { role: true, content: true, createdAt: true },
  })

  return Response.json({ messages })
}
