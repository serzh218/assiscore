import { prisma } from '@/lib/db'

/**
 * Reset usage quotas for entitlements whose billing period has ended.
 * Finds all entitlements with periodEnd < now and sets their usage to 0
 * while pushing periodEnd one month forward.
 *
 * @returns number of entitlements reset
 */
export async function resetQuotas(now = new Date()) {
  // Find entitlements with expired periods
  const entitlements = await prisma.entitlement.findMany({
    where: { periodEnd: { lt: now } },
  } as any)

  const nextPeriodEnd = new Date(now)
  nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1)

  for (const ent of entitlements) {
    await prisma.entitlement.update({
      where: { id: ent.id },
      data: { usage: 0, periodEnd: nextPeriodEnd },
    } as any)
  }

  return entitlements.length
}
