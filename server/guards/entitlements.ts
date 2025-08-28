import { prisma } from '@/lib/db'

export class PaywallError extends Error {
  code = 'PAYWALL'
  constructor(message = 'Upgrade required') {
    super(message)
    this.name = 'PaywallError'
  }
}

export async function assertEntitlements(user: { id: string }, feature: string, amount = 1) {
  const ent = await prisma.entitlement.findFirst({
    where: { userId: user.id, feature },
  })
  if (!ent || ent.usage + amount > ent.limit || (ent.expiresAt && ent.expiresAt < new Date())) {
    throw new PaywallError()
  }
  await prisma.entitlement.update({
    where: { id: ent.id },
    data: { usage: { increment: amount } },
  })
}
