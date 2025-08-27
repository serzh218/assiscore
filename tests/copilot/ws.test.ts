import { describe, it, expect, vi } from 'vitest'
import { handleCopilotSocket, __setTestLimit } from '@/server/copilot/ws'

class MockWS {
  peer?: MockWS
  handlers: Record<string, Function[]> = {}
  addEventListener(type: string, cb: any) {
    this.handlers[type] = this.handlers[type] || []
    this.handlers[type].push(cb)
  }
  send(data: string) {
    this.peer?.handlers['message']?.forEach((h) => h({ data }))
  }
}

function createPair() {
  const a = new MockWS()
  const b = new MockWS()
  a.peer = b
  b.peer = a
  return { server: a, client: b }
}

vi.mock('@/server/ai/context', () => ({
  makeCodeContext: vi.fn(async () => ({ content: 'ctx' })),
}))

describe('copilot ws', () => {
  it('streams suggestion', async () => {
    const { server, client } = createPair()
    const msgs: any[] = []
    client.addEventListener('message', (e: any) => msgs.push(JSON.parse(e.data)))
    handleCopilotSocket(server as any, 'p1', 'u1')
    client.send(
      JSON.stringify({
        type: 'cursorUpdate',
        filePath: 'file.ts',
        content: 'hi',
        cursorLine: 0,
        cursorCol: 2,
      }),
    )
    await new Promise((r) => setTimeout(r, 0))
    const done = msgs.find((m) => m.type === 'suggestionDone')
    expect(done.fullText).toBe('suggestion')
  })

  it('enforces limit', async () => {
    __setTestLimit(1)
    const { server, client } = createPair()
    const msgs: any[] = []
    client.addEventListener('message', (e: any) => msgs.push(JSON.parse(e.data)))
    handleCopilotSocket(server as any, 'p1', 'u1')
    const msg = JSON.stringify({
      type: 'cursorUpdate',
      filePath: 'file.ts',
      content: 'hi',
      cursorLine: 0,
      cursorCol: 2,
    })
    client.send(msg)
    await new Promise((r) => setTimeout(r, 0))
    client.send(msg)
    await new Promise((r) => setTimeout(r, 0))
    const err = msgs.find((m) => m.type === 'error')
    expect(err.code).toBe('LIMIT_REACHED')
  })
})
