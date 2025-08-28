import { beforeEach, describe, expect, it, vi } from 'vitest'

const subscriptionCreate = vi.fn()
const entitlementCreate = vi.fn()
const paymentLogCreate = vi.fn()

vi.mock('@/server/integrations/yookassa', () => ({
  handleWebhook: vi.fn(async () => {}),
}))

vi.mock('@/server/repo/payment', () => ({
  getPaymentByExternalId: vi.fn(async () => ({
    id: 'p1',
    userId: 'u1',
    amount: 1000,
    type: 'PRO_SUBSCRIPTION',
  })),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    plan: {
      findUnique: vi.fn(async () => ({
        id: 'plan1',
        currency: 'RUB',
        features: {
          genPerMonth: 1,
          privateProjects: 2,
          assistantCallsPerHour: 3,
          testFirstCyclesPerMonth: 4,
        },
      })),
    },
    subscription: {
      findFirst: vi.fn(async () => null),
      create: subscriptionCreate,
      update: vi.fn(),
    },
    entitlement: {
      findFirst: vi.fn(async () => null),
      create: entitlementCreate,
      update: vi.fn(),
    },
    paymentLog: { create: paymentLogCreate },
  },
}))

describe('yookassa webhook', () => {
  beforeEach(() => {
    subscriptionCreate.mockClear()
    entitlementCreate.mockClear()
    paymentLogCreate.mockClear()
    process.env.YOOKASSA_WEBHOOK_TOKEN = 'tok'
  })

  it('payment.succeeded updates subscription and entitlements', async () => {
    const { POST } = await import('@/app/api/billing/yookassa/webhook/route')
    const req = new Request('http://test?token=tok', {
      method: 'POST',
      body: JSON.stringify({
        event: 'payment.succeeded',
        object: { id: 'ext1', status: 'succeeded', payment_method: { card: '4111' } },
      }),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(subscriptionCreate).toHaveBeenCalled()
    expect(entitlementCreate).toHaveBeenCalled()
    expect(paymentLogCreate).toHaveBeenCalled()
    const raw = paymentLogCreate.mock.calls[0][0].data.raw
    expect(raw.object.payment_method).toBeUndefined()
  })
})
