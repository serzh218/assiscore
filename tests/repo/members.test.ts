import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProjectRole } from '@prisma/client'
import {
  addMember,
  listMembers,
  updateMemberRole,
  removeMember,
  getRole,
} from '@/server/repo/members'

let records: any[] = []
const users: Record<string, { email: string; name?: string }> = {
  u1: { email: 'u1@example.com', name: 'User1' },
  u2: { email: 'u2@example.com', name: 'User2' },
}

vi.mock('@/lib/db', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(async () => ({ ownerId: 'u0' })),
    },
    projectMember: {
      findMany: vi.fn(async ({ where }: any) => {
        return records
          .filter((r) => r.projectId === where.projectId)
          .map((r) => ({ ...r, user: users[r.userId] }))
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const rec = records.find(
          (r) =>
            r.projectId === where.projectId_userId.projectId &&
            r.userId === where.projectId_userId.userId,
        )
        return rec ? { ...rec } : null
      }),
      create: vi.fn(async ({ data }: any) => {
        if (records.some((r) => r.projectId === data.projectId && r.userId === data.userId)) {
          throw new Error('unique')
        }
        const rec = { ...data, createdAt: new Date(), id: `m${records.length + 1}` }
        records.push(rec)
        return rec
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const rec = records.find(
          (r) =>
            r.projectId === where.projectId_userId.projectId &&
            r.userId === where.projectId_userId.userId,
        )
        if (!rec) throw new Error('notfound')
        Object.assign(rec, data)
        return rec
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = records.findIndex(
          (r) =>
            r.projectId === where.projectId_userId.projectId &&
            r.userId === where.projectId_userId.userId,
        )
        if (idx >= 0) records.splice(idx, 1)
      }),
    },
  },
}))

describe('members repo', () => {
  beforeEach(() => {
    records = []
  })

  it('add/update/remove member', async () => {
    await addMember('p1', 'u1', ProjectRole.COLLABORATOR)
    await addMember('p1', 'u2', ProjectRole.VIEWER)
    let list = await listMembers('p1')
    expect(list).toHaveLength(2)
    expect(await getRole('p1', 'u1')).toBe(ProjectRole.COLLABORATOR)
    await updateMemberRole('p1', 'u2', ProjectRole.COLLABORATOR)
    expect(await getRole('p1', 'u2')).toBe(ProjectRole.COLLABORATOR)
    await removeMember('p1', 'u1')
    list = await listMembers('p1')
    expect(list).toHaveLength(1)
  })

  it('enforces uniqueness', async () => {
    await addMember('p1', 'u1', ProjectRole.COLLABORATOR)
    await expect(addMember('p1', 'u1', ProjectRole.VIEWER)).rejects.toThrow()
  })
})
