import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { PRO_SUBSCRIPTION_PRICE, TOKEN_PACKAGES } from '@/lib/billing'
import { createPayment as createPaymentRecord, updatePayment } from '@/server/repo/payment'
import { createPayment as createYookassaPayment } from '@/server/integrations/yookassa'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const type = body.type as 'PRO_SUBSCRIPTION' | 'TOKENS'
    if (type !== 'PRO_SUBSCRIPTION' && type !== 'TOKENS') {
      return NextResponse.json({ error: 'invalid type' }, { status: 400 })
    }

    let amount = 0
    let tokens: number | undefined
    if (type === 'PRO_SUBSCRIPTION') {
      amount = PRO_SUBSCRIPTION_PRICE
    } else {
      tokens = Number(body.tokens)
      const pkg = TOKEN_PACKAGES[tokens]
      if (!pkg) {
        return NextResponse.json({ error: 'invalid tokens' }, { status: 400 })
      }
      amount = pkg
    }

    const payment = await createPaymentRecord({
      userId: user.id,
      type,
      amount,
      tokens,
      status: 'pending',
      externalId: '',
    })

    const { confirmationUrl, externalId } = await createYookassaPayment(user.id, type, {
      tokens,
      amount,
    })

    await updatePayment(payment.id, { externalId })

    return NextResponse.json({ confirmationUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[billing/create]', msg)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
