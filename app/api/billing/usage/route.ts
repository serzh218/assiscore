import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { prisma } from '@/lib/db'
import { getPlan } from '@/server/billing/plans'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const plan = await getPlan(user.plan)
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const ent = await prisma.entitlement.findFirst({
      where: { userId: user.id, feature: 'privateProjects' },
    } as any)
    const privateRemaining = ent ? Math.max(ent.limit - ent.usage, 0) : 0
    const periodEnd = ent?.periodEnd ?? null

    const data = {
      planCode: user.plan,
      quotas: {
        tokens: {
          remaining: user.tokens,
          limit: plan.features.monthlyTokens,
        },
        privateProjects: {
          remaining: privateRemaining,
          limit: plan.features.privateProjects,
        },
      },
      periodEnd,
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('[billing/usage]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
