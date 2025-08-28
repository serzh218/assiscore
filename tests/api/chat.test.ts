import { describe, it, expect, beforeEach, vi } from 'vitest'

let store: any[] = []

vi.mock('@/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    chatMessage: {
      create: vi.fn(async ({ data }: any) => {
        const m = { ...data, createdAt: new Date() }
        store.push(m)
        return m
      }),
      findMany: vi.fn(async () => store),
    },
  },
}))

describe('chat API', () => {
  beforeEach(() => {
    store = []
  })

  it('saves user and assistant messages', async () => {
    const { POST } = await import('@/app/api/projects/[id]/chat/route')
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ message: 'hello', mode: 'default' }),
      }),
      { params: { id: 'p1' } } as any,
    )
    expect(res.status).toBe(200)
    expect(store.filter((m) => m.role === 'user').length).toBe(1)
    expect(store.filter((m) => m.role === 'assistant').length).toBe(1)
  })

  it('records system message for mode', async () => {
    const { POST } = await import('@/app/api/projects/[id]/chat/route')
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ message: 'hi', mode: 'refactor' }),
      }),
      { params: { id: 'p1' } } as any,
    )
    const data = await res.json()
    expect(data.messages.some((m: any) => m.role === 'system')).toBe(true)
  })
})
