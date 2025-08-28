import { NextResponse } from 'next/server'
import { resetQuotas } from '@/server/billing/resetQuotas'

export async function POST() {
  try {
    const count = await resetQuotas()
    return NextResponse.json({ ok: true, reset: count })
  } catch (err) {
    console.error('[billing/cron/reset]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
