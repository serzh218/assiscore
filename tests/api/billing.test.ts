import { describe, it, expect, beforeEach, vi } from 'vitest';

let user: any;
let payments: any[];

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => user),
}));

vi.mock('@/server/repo/payment', () => ({
  createPayment: vi.fn(async (data: any) => {
    const payment = {
      id: 'p' + (payments.length + 1),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    payments.push(payment);
    return payment;
  }),
  updatePayment: vi.fn(async (id: string, data: any) => {
    const p = payments.find((x) => x.id === id);
    if (p) Object.assign(p, data);
    return p;
  }),
  getPaymentByExternalId: vi.fn(async (externalId: string) =>
    payments.find((p) => p.externalId === externalId) || null
  ),
  listPayments: vi.fn(async () => payments),
}));

vi.mock('@/server/integrations/yookassa', () => ({
  createPayment: vi.fn(async () => ({
    confirmationUrl: 'http://pay.mock',
    externalId: 'ext-' + (payments.length + 1),
  })),
  handleWebhook: vi.fn(async (body: any) => {
    const id = body.object.id;
    const status = body.object.status;
    const p = payments.find((x) => x.externalId === id);
    if (p) {
      p.status = status;
      if (status === 'succeeded') {
        if (p.type === 'PRO_SUBSCRIPTION') {
          user.plan = 'PRO';
          user.tokens += 5000;
        } else if (p.type === 'TOKENS' && p.tokens) {
          user.tokens += p.tokens;
        }
      }
    }
  }),
}));

describe('billing api', () => {
  beforeEach(() => {
    user = { id: 'u1', plan: 'FREE', tokens: 0 };
    payments = [];
  });

  it('creates PRO payment', async () => {
    const { POST } = await import('@/app/api/billing/create/route');
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ type: 'PRO_SUBSCRIPTION' }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.confirmationUrl).toBeTruthy();
  });

  it('creates token payment', async () => {
    const { POST } = await import('@/app/api/billing/create/route');
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ type: 'TOKENS', tokens: 100 }),
      })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.confirmationUrl).toBeTruthy();
  });

  it('webhook success updates payment and user', async () => {
    const { POST: create } = await import('@/app/api/billing/create/route');
    const { POST: webhook } = await import('@/app/api/billing/webhook/route');

    // PRO subscription
    await create(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ type: 'PRO_SUBSCRIPTION' }),
      })
    );
    const proPayment = payments[0];
    await webhook(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ object: { id: proPayment.externalId, status: 'succeeded' } }),
      })
    );
    expect(proPayment.status).toBe('succeeded');
    expect(user.plan).toBe('PRO');

    // Tokens purchase
    await create(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ type: 'TOKENS', tokens: 100 }),
      })
    );
    const tokenPayment = payments[1];
    await webhook(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ object: { id: tokenPayment.externalId, status: 'succeeded' } }),
      })
    );
    expect(tokenPayment.status).toBe('succeeded');
    expect(user.tokens).toBe(5100);
  });
});
