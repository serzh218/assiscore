import { describe, it, expect, vi, beforeEach } from 'vitest'

const notifications = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'GENERATION_READY',
    title: 't1',
    body: 'b1',
    createdAt: new Date(),
  },
  {
    id: 'n2',
    userId: 'u1',
    type: 'GENERATION_READY',
    title: 't2',
    body: 'b2',
    createdAt: new Date(),
  },
  {
    id: 'n3',
    userId: 'u2',
    type: 'GENERATION_READY',
    title: 'x',
    body: 'x',
    createdAt: new Date(),
  },
]

vi.mock('@/auth', () => ({ getCurrentUser: vi.fn(async () => ({ id: 'u1' })) }))

vi.mock('@/server/repo/notification', () => ({
  listNotifications: vi.fn(async (userId: string, { limit, cursor }: any) => {
    const arr = notifications.filter((n) => n.userId === userId)
    const start = cursor ? arr.findIndex((n) => n.id === cursor) + 1 : 0
    const slice = arr.slice(start, start + limit)
    const nextCursor = arr.length > start + limit ? arr[start + limit].id : null
    return { items: slice, nextCursor, total: arr.length }
  }),
  markRead: vi.fn(async (userId: string, ids: string[]) => {
    notifications.forEach((n) => {
      if (n.userId === userId && ids.includes(n.id)) n.readAt = new Date()
    })
  }),
  markAllRead: vi.fn(async (userId: string) => {
    notifications.forEach((n) => {
      if (n.userId === userId) n.readAt = new Date()
    })
  }),
  getPreferences: vi.fn(),
  upsertPreferences: vi.fn(),
}))

describe('notifications API', () => {
  beforeEach(() => {
    notifications.forEach((n) => delete n.readAt)
  })

  it('GET returns own notifications with pagination', async () => {
    const { GET } = await import('@/app/api/notifications/route')
    const res = await GET(new Request('http://test/api/notifications?limit=1'))
    const data = await res.json()
    expect(data.items.length).toBe(1)
    expect(data.nextCursor).toBeDefined()
    expect(data.total).toBe(2)
  })

  it('POST read marks specific ids', async () => {
    const { POST } = await import('@/app/api/notifications/read/route')
    await POST(
      new Request('http://test/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({ ids: ['n1'] }),
      }),
    )
    expect(notifications[0].readAt).toBeInstanceOf(Date)
    expect(notifications[1].readAt).toBeUndefined()
  })

  it('POST read without ids marks all', async () => {
    const { POST } = await import('@/app/api/notifications/read/route')
    await POST(
      new Request('http://test/api/notifications/read', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
    expect(notifications[0].readAt).toBeInstanceOf(Date)
    expect(notifications[1].readAt).toBeInstanceOf(Date)
  })
})
