import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/auth'
import { getPlan } from '@/server/billing/plans'
import { updateUserPlan, updateUserTokens } from '@/server/repo/user'

export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const plan = await getPlan('FREE')
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    await updateUserPlan(user.id, 'FREE')
    if (plan.features.monthlyTokens > 0) {
      await updateUserTokens(user.id, plan.features.monthlyTokens)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[billing/free]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
