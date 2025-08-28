import { NextResponse } from 'next/server'
import { handleWebhook } from '@/server/integrations/yookassa'
import { getPaymentByExternalId } from '@/server/repo/payment'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const externalId = body?.object?.id as string | undefined
    if (externalId) {
      const payment = await getPaymentByExternalId(externalId)
      if (payment) {
        await handleWebhook(body)
      }
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[billing/webhook]', msg)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
