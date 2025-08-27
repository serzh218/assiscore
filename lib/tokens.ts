import { Plan } from '@prisma/client';
import { prisma } from '@/lib/db';
import { COSTS, PLANS } from '@/lib/limits';

export function estimateGenerationCost(opts: { textLen: number; hasFigma?: boolean }): number {
  const base = COSTS.generationBase;
  const per = Math.ceil(opts.textLen / 1000) * COSTS.generationPer1000Chars;
  const fig = opts.hasFigma ? COSTS.figmaImport : 0;
  return base + per + fig;
}

export function estimatePatchCost(): number {
  return COSTS.patch;
}

export async function monthlyGenerationCount(userId: string): Promise<number> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return prisma.generation.count({
    where: {
      project: { ownerId: userId },
      createdAt: { gte: start },
    },
  });
}

export async function canGenerate(
  user: { id: string; plan: Plan; tokens: number },
  estimatedCost: number,
): Promise<{ ok: true } | { ok: false; code: 'LIMIT' | 'TOKENS'; message: string }> {
  const limits = PLANS[user.plan];
  const used = await monthlyGenerationCount(user.id);
  if (used >= limits.genPerMonth) {
    return { ok: false, code: 'LIMIT', message: 'Лимит генераций на месяц исчерпан' };
  }
  if (user.tokens < estimatedCost) {
    return { ok: false, code: 'TOKENS', message: 'Недостаточно токенов' };
  }
  return { ok: true };
}

export async function chargeTokens(
  userId: string,
  amount: number,
  reason: string,
  meta?: any,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId }, select: { tokens: true } });
    if (!user) throw new Error('User not found');
    if (user.tokens + amount < 0) {
      const err: any = new Error('Недостаточно токенов');
      err.code = 'TOKENS_NOT_ENOUGH';
      throw err;
    }
    await tx.user.update({ where: { id: userId }, data: { tokens: { increment: amount } } });
    await tx.tokenTransaction.create({ data: { userId, amount, reason, meta } });
  });
}

export async function refundTokens(
  userId: string,
  amount: number,
  reason: string,
  meta?: any,
): Promise<void> {
  await chargeTokens(userId, Math.abs(amount), reason, meta);
}
