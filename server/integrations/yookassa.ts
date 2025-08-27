import axios from 'axios';
import { prisma } from '@/lib/db';
import { PLANS } from '@/lib/limits';
import { updateUserPlan, updateUserTokens } from '@/server/repo/user';

export async function createPayment(
  userId: string,
  type: 'PRO_SUBSCRIPTION' | 'TOKENS',
  opts: { tokens?: number; amount: number }
): Promise<{ confirmationUrl: string; externalId: string }> {
  const { tokens, amount } = opts;
  const description =
    type === 'PRO_SUBSCRIPTION'
      ? 'Подписка PRO'
      : `Пакет токенов ${tokens}`;
  const value = (amount / 100).toFixed(2);
  const { data } = await axios.post(
    'https://api.yookassa.ru/v3/payments',
    {
      amount: { value, currency: 'RUB' },
      description,
      confirmation: {
        type: 'redirect',
        return_url: process.env.BILLING_RETURN_URL,
      },
    },
    {
      auth: {
        username: process.env.YOOKASSA_SHOP_ID || '',
        password: process.env.YOOKASSA_SECRET_KEY || '',
      },
    }
  );
  return {
    confirmationUrl: data.confirmation?.confirmation_url,
    externalId: data.id,
  };
}

export async function handleWebhook(body: any) {
  const externalId = body?.object?.id as string | undefined;
  const status = body?.object?.status as string | undefined;
  if (!externalId || !status) return;

  const payment = await prisma.payment.findFirst({ where: { externalId } });
  if (!payment) return;

  await prisma.payment.update({ where: { id: payment.id }, data: { status } });

  if (status === 'succeeded') {
    if (payment.type === 'PRO_SUBSCRIPTION') {
      await updateUserPlan(payment.userId, 'PRO');
      await updateUserTokens(payment.userId, PLANS.PRO.monthlyTokens);
    } else if (payment.type === 'TOKENS' && payment.tokens) {
      await updateUserTokens(payment.userId, payment.tokens);
    }
  }
}
