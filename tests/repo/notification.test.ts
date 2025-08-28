import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NotificationType } from '@prisma/client'
import {
  createNotification,
  listNotifications,
  markRead,
  markAllRead,
} from '@/server/repo/notification'

let records: any[] = []

vi.mock('@/lib/db', () => ({
  prisma: {
    notification: {
      create: vi.fn(async ({ data }: any) => {
        const rec = {
          ...data,
          id: `n${records.length + 1}`,
          createdAt: new Date(Date.now() + records.length),
        }
        records.push(rec)
        return rec
      }),
      findMany: vi.fn(async ({ where, cursor, take }: any) => {
        let arr = records.filter((r) => r.userId === where.userId)
        arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        if (cursor) {
          const idx = arr.findIndex((r) => r.id === cursor.id) + 1
          arr = arr.slice(idx)
        }
        if (typeof take === 'number') arr = arr.slice(0, take)
        return arr
      }),
      count: vi.fn(
        async ({ where }: any) => records.filter((r) => r.userId === where.userId).length,
      ),
      updateMany: vi.fn(async ({ where, data }: any) => {
        records.forEach((r) => {
          if (r.userId === where.userId && (!where.id || where.id.in.includes(r.id))) {
            if (where.readAt === null ? r.readAt == null : true) {
              r.readAt = data.readAt
            }
          }
        })
      }),
    },
    notificationPreference: {
      findUnique: vi.fn(),
      create: vi.fn(async ({ data }: any) => data),
    },
  },
}))

describe('notification repo', () => {
  beforeEach(() => {
    records = []
  })

  it('create and list', async () => {
    await createNotification('u1', {
      type: NotificationType.GENERATION_READY,
      title: 't1',
      body: 'b1',
    })
    await createNotification('u1', {
      type: NotificationType.GENERATION_READY,
      title: 't2',
      body: 'b2',
    })
    const res = await listNotifications('u1', { limit: 10 })
    expect(res.total).toBe(2)
    expect(res.items[0].title).toBe('t2')
  })

  it('markRead and markAllRead', async () => {
    await createNotification('u1', {
      type: NotificationType.GENERATION_READY,
      title: 't1',
      body: 'b1',
    })
    await createNotification('u1', {
      type: NotificationType.GENERATION_READY,
      title: 't2',
      body: 'b2',
    })
    const ids = records.map((r) => r.id)
    await markRead('u1', [ids[0]])
    expect(records[0].readAt).toBeInstanceOf(Date)
    expect(records[1].readAt).toBeUndefined()
    await markAllRead('u1')
    expect(records[1].readAt).toBeInstanceOf(Date)
  })
})
