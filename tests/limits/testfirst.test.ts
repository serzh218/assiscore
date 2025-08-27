import { describe, it, expect } from 'vitest'
import { COSTS, PLANS } from '@/lib/limits'

describe('test-first limits', () => {
  it('has costs', () => {
    expect(COSTS.testFirstInit).toBe(40)
    expect(COSTS.testIteration).toBe(30)
  })
  it('plans have cycle limits', () => {
    expect(PLANS.FREE.testFirstCyclesPerMonth).toBe(3)
    expect(PLANS.PRO.testFirstCyclesPerMonth).toBe(30)
  })
})
