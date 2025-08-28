import { NextResponse } from 'next/server'
import { handleWebhook } from '@/server/integrations/yookassa'
import { getPaymentByExternalId } from '@/server/repo/payment'
import { prisma } from '@/lib/db'
import type { Features } from '@/server/billing/plans'

function maskPii(data: any) {
  const clone = JSON.parse(JSON.stringify(data))
  if (clone?.object) {
    delete clone.object.payment_method
    if (clone.object.recipient) delete clone.object.recipient
    if (clone.object.payer) delete clone.object.payer
  }
  return clone
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  if (token !== process.env.YOOKASSA_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const event = body?.event as string | undefined
    const externalId = body?.object?.id as string | undefined
    const status = body?.object?.status as string | undefined
    if (!event || !externalId || !status) {
      return NextResponse.json({ ok: true })
    }
    const payment = await getPaymentByExternalId(externalId)
    if (!payment) {
      return NextResponse.json({ ok: true })
    }
    await handleWebhook(body)
    let plan = null
    if (payment.type === 'PRO_SUBSCRIPTION') {
      plan = await prisma.plan.findUnique({ where: { code: 'PRO' } })
    }
    if (event === 'payment.succeeded' && payment.type === 'PRO_SUBSCRIPTION' && plan) {
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      const existingSub = await prisma.subscription.findFirst({ where: { userId: payment.userId } })
      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: { planId: plan.id, status: 'active', startDate, endDate },
        })
      } else {
        await prisma.subscription.create({
          data: { userId: payment.userId, planId: plan.id, status: 'active', startDate, endDate },
        })
      }
      const features = plan.features as Features
      const quotas: [keyof Features, number][] = [
        ['genPerMonth', features.genPerMonth],
        ['privateProjects', features.privateProjects],
        ['assistantCallsPerHour', features.assistantCallsPerHour],
        ['testFirstCyclesPerMonth', features.testFirstCyclesPerMonth],
      ]
      for (const [feature, limit] of quotas) {
        const ent = await prisma.entitlement.findFirst({
          where: { userId: payment.userId, feature },
        })
        if (ent) {
          await prisma.entitlement.update({
            where: { id: ent.id },
            data: { limit, usage: 0, expiresAt: endDate },
          })
        } else {
          await prisma.entitlement.create({
            data: { userId: payment.userId, feature, limit, usage: 0, expiresAt: endDate },
          })
        }
      }
    }
    await prisma.paymentLog.create({
      data: {
        userId: payment.userId,
        planId: plan?.id,
        amount: payment.amount,
        currency: plan?.currency || 'RUB',
        status,
        externalId,
        raw: maskPii(body),
      },
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[billing/yookassa/webhook]', msg)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
