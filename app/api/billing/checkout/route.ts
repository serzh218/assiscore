import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { getPlan } from '@/server/billing/plans'
import { updateUserPlan, updateUserTokens } from '@/server/repo/user'
import { prisma } from '@/lib/db'
import { createPayment as createYookassaPayment } from '@/server/integrations/yookassa'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const planCode = body.planCode as string
    if (!planCode) {
      return NextResponse.json({ error: 'planCode required' }, { status: 400 })
    }

    if (planCode === 'FREE') {
      return NextResponse.json({ error: 'use free endpoint' }, { status: 400 })
    }

    const plan = await getPlan(planCode)
    if (!plan) {
      return NextResponse.json({ error: 'plan not found' }, { status: 404 })
    }

    if (plan.priceCents <= 0) {
      return NextResponse.json({ error: 'use free endpoint' }, { status: 400 })
    }

    if (!process.env.YOOKASSA_SHOP_ID || !process.env.YOOKASSA_SECRET_KEY) {
      await updateUserPlan(user.id, plan.code as any)
      if (plan.features.monthlyTokens > 0) {
        await updateUserTokens(user.id, plan.features.monthlyTokens)
      }
      const returnUrl = process.env.BILLING_RETURN_URL || '/billing'
      return NextResponse.json({ confirmationUrl: `${returnUrl}?status=success` })
    }

    const { confirmationUrl, externalId } = await createYookassaPayment(
      user.id,
      'PRO_SUBSCRIPTION',
      { amount: plan.priceCents },
    )

    try {
      const dbPlan = await prisma.plan.findUnique({ where: { code: plan.code } })
      await prisma.paymentLog.create({
        data: {
          userId: user.id,
          planId: dbPlan?.id,
          amount: plan.priceCents,
          currency: plan.currency,
          status: 'pending',
          externalId,
        },
      })
    } catch {
      // ignore logging errors
    }

    return NextResponse.json({ confirmationUrl })
  } catch (err) {
    console.error('[billing/checkout]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
