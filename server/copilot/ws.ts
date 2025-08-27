import { makeCodeContext } from '@/server/ai/context'

function approxTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

interface Counter {
  date: string
  count: number
}

const counters = new Map<string, Counter>()
let testLimit: number | null = null

export function __setTestLimit(limit: number | null) {
  testLimit = limit
  counters.clear()
}

function checkLimit(userId: string, plan: 'FREE' | 'PRO' = 'FREE'): boolean {
  const today = new Date().toDateString()
  let entry = counters.get(userId)
  if (!entry || entry.date !== today) {
    entry = { date: today, count: 0 }
    counters.set(userId, entry)
  }
  const limit = testLimit ?? (plan === 'PRO' ? 1000 : 100)
  if (entry.count >= limit) return false
  entry.count += 1
  return true
}

export function handleCopilotSocket(ws: any, projectId: string, userId: string) {
  ws.addEventListener('message', async (event: any) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type !== 'cursorUpdate') return
      if (!checkLimit(userId)) {
        ws.send(JSON.stringify({ type: 'error', code: 'LIMIT_REACHED' }))
        return
      }
      if (/(\.env|secrets|prisma)/.test(data.filePath)) {
        ws.send(JSON.stringify({ type: 'error', code: 'FORBIDDEN' }))
        return
      }
      const ctx = await makeCodeContext({ projectId, filePath: data.filePath })
      if (approxTokens(ctx.content + data.content) > 4000) {
        ws.send(JSON.stringify({ type: 'error', code: 'CONTEXT_TOO_LARGE' }))
        return
      }
      const suggestion = 'suggestion'
      let full = ''
      for (const ch of suggestion) {
        full += ch
        ws.send(JSON.stringify({ type: 'suggestionChunk', text: ch }))
      }
      ws.send(JSON.stringify({ type: 'suggestionDone', fullText: full }))
    } catch {
      ws.send(JSON.stringify({ type: 'error', code: 'BAD_REQUEST' }))
    }
  })
}
