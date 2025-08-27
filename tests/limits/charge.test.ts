import { describe, it, expect, beforeEach, vi } from 'vitest';

const users: Record<string, { id: string; tokens: number }> = {};
const transactions: any[] = [];

vi.mock('@/lib/db', () => {
  const prismaMock: any = {
    user: {
      findUnique: async ({ where: { id } }: any) => users[id] ?? null,
      update: async ({ where: { id }, data }: any) => {
        const u = users[id];
        if (data.tokens?.increment) u.tokens += data.tokens.increment;
        return u;
      },
    },
    tokenTransaction: {
      create: async ({ data }: any) => {
        transactions.push(data);
        return data;
      },
    },
    $transaction: async (fn: any) => fn(prismaMock),
  };
  return { prisma: prismaMock };
});

import { spendTokens } from '@/server/guards/limits';

describe('spendTokens', () => {
  const userId = 'u1';
  beforeEach(() => {
    users[userId] = { id: userId, tokens: 100 };
    transactions.length = 0;
  });

  it('charges tokens and records transaction', async () => {
    await spendTokens(userId, 40, 'test');
    expect(users[userId].tokens).toBe(60);
    expect(transactions).toHaveLength(1);
    expect(transactions[0]).toMatchObject({ userId, amount: -40, reason: 'test' });
  });

  it('throws on insufficient tokens', async () => {
    await expect(spendTokens(userId, 200, 'test')).rejects.toMatchObject({ code: 'TOKENS_NOT_ENOUGH' });
    expect(users[userId].tokens).toBe(100);
    expect(transactions).toHaveLength(0);
  });
});
