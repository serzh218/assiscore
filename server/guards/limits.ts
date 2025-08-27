import { prisma } from '@/lib/db';
import { canGenerate, chargeTokens } from '@/lib/tokens';

export async function assertCanGenerate(userId: string, estimatedCost: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, plan: true, tokens: true },
  });
  if (!user) {
    const err: any = new Error('User not found');
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  const res = await canGenerate(user, estimatedCost);
  if (!res.ok) {
    const err: any = new Error(res.message);
    err.code = res.code;
    throw err;
  }
}

export async function spendTokens(
  userId: string,
  amount: number,
  reason: string,
  meta?: any,
) {
  await chargeTokens(userId, -Math.abs(amount), reason, meta);
}
