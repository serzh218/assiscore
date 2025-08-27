import type { Payment } from '@prisma/client'

import { prisma } from '@/lib/db'
import type { PaymentDTO } from '@/types/domain'

const toPaymentDTO = (p: Payment): PaymentDTO => ({
  id: p.id,
  userId: p.userId,
  type: p.type,
  amount: p.amount,
  tokens: p.tokens ?? undefined,
  status: p.status,
  externalId: p.externalId,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
})

export async function createPayment(data: {
  userId: string
  type: string
  amount: number
  tokens?: number
  status: string
  externalId: string
}): Promise<PaymentDTO> {
  const payment = await prisma.payment.create({ data })
  return toPaymentDTO(payment)
}

export async function updatePayment(
  id: string,
  data: Partial<Payment>,
): Promise<PaymentDTO | null> {
  try {
    const payment = await prisma.payment.update({ where: { id }, data })
    return toPaymentDTO(payment)
  } catch (_e) {
    return null
  }
}

export async function getPaymentByExternalId(externalId: string): Promise<PaymentDTO | null> {
  const payment = await prisma.payment.findFirst({ where: { externalId } })
  return payment ? toPaymentDTO(payment) : null
}

export async function listPayments(userId: string): Promise<PaymentDTO[]> {
  const payments = await prisma.payment.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return payments.map(toPaymentDTO)
}
