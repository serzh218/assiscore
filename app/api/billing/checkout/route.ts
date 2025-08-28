import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { getPlan } from '@/server/billing/plans'
import { createPayment as createPaymentRecord, updatePayment } from '@/server/repo/payment'
import { createPayment as createYookassaPayment } from '@/server/integrations/yookassa'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const planCode = body.plan as string
    if (!planCode) {
      return NextResponse.json({ error: 'plan required' }, { status: 400 })
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

    const payment = await createPaymentRecord({
      userId: user.id,
      type: 'PRO_SUBSCRIPTION',
      amount: plan.priceCents,
      status: 'pending',
      externalId: '',
    })

    const { confirmationUrl, externalId } = await createYookassaPayment(
      user.id,
      'PRO_SUBSCRIPTION',
      { amount: plan.priceCents },
    )

    await updatePayment(payment.id, { externalId })

    return NextResponse.json({ confirmationUrl })
  } catch (err) {
    console.error('[billing/checkout]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
