import { beforeEach, describe, expect, it, vi } from 'vitest'
import { assertEntitlements, PaywallError } from '@/server/guards/entitlements'

const { findFirst, update } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    entitlement: {
      findFirst,
      update,
    },
  },
}))

describe('private project entitlement guard', () => {
  beforeEach(() => {
    findFirst.mockReset()
    update.mockReset()
  })

  it('allows when quota available', async () => {
    findFirst.mockResolvedValue({
      id: 'e1',
      userId: 'u1',
      feature: 'privateProjects',
      limit: 2,
      usage: 1,
      expiresAt: new Date(Date.now() + 1000 * 60),
    })
    await expect(assertEntitlements({ id: 'u1' }, 'privateProjects')).resolves.toBeUndefined()
    expect(update).toHaveBeenCalled()
  })

  it('blocks when quota exceeded', async () => {
    findFirst.mockResolvedValue({
      id: 'e1',
      userId: 'u1',
      feature: 'privateProjects',
      limit: 1,
      usage: 1,
      expiresAt: new Date(Date.now() + 1000 * 60),
    })
    await expect(assertEntitlements({ id: 'u1' }, 'privateProjects')).rejects.toBeInstanceOf(
      PaywallError,
    )
    expect(update).not.toHaveBeenCalled()
  })
})
