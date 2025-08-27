import { describe, it, expect, beforeEach } from 'vitest'
import { totals, httpDuration } from '../../server/obs/metrics'
import { getSlo } from '../../server/obs/slo'

describe('slo', () => {
  beforeEach(() => {
    totals.total = 0
    totals.errors = 0
    httpDuration.reset()
  })

  it('fails when uptime below target', () => {
    totals.total = 100
    totals.errors = 5
    const slo = getSlo()
    expect(slo.uptime.ok).toBe(false)
  })
})
