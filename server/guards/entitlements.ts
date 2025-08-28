import { prisma } from '@/lib/db'
import { getPlan, type Features } from '@/server/billing/plans'

export class PaywallError extends Error {
  code = 'PAYWALL'
  constructor(message = 'Upgrade required') {
    super(message)
    this.name = 'PaywallError'
  }
}

export async function getUserPlan(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
  if (!user) throw new Error('User not found')
  const plan = await getPlan(user.plan)
  if (!plan) throw new Error('Plan not found')
  return plan
}

export async function getEntitlements(userId: string): Promise<Features> {
  const plan = await getUserPlan(userId)
  return plan.features as Features
}

export async function assertEntitlement(userId: string, feature: keyof Features) {
  const entitlements = await getEntitlements(userId)
  if (!entitlements[feature]) {
    throw new PaywallError()
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
