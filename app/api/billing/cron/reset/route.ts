import { NextResponse } from 'next/server'
import { resetQuotas } from '@/server/billing/resetQuotas'

export async function POST() {
  try {
    const count = await resetQuotas()
    return NextResponse.json({ ok: true, reset: count })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[billing/cron/reset]', msg)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
