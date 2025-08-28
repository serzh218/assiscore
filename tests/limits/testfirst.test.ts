import { describe, it, expect } from 'vitest'
import { COSTS } from '@/lib/limits'
import { PLANS } from '@/server/billing/plans'

describe('test-first limits', () => {
  it('has costs', () => {
    expect(COSTS.testFirstInit).toBe(40)
    expect(COSTS.testIteration).toBe(30)
  })
  it('plans have cycle limits', () => {
    const free = PLANS.find((p) => p.code === 'FREE')!
    const pro = PLANS.find((p) => p.code === 'PRO')!
    expect(free.features.testFirstCyclesPerMonth).toBe(3)
    expect(pro.features.testFirstCyclesPerMonth).toBe(30)
  })
})
