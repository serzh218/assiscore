import { describe, expect, it, beforeEach } from 'vitest'
import { httpDuration, httpRequests, register } from '../../server/obs/metrics'

describe('metrics', () => {
  beforeEach(() => {
    httpRequests.reset()
    httpDuration.reset()
  })

  it('records requests and duration', async () => {
    httpRequests.inc({ method: 'GET', route: '/t', status: '200' })
    httpDuration.observe({ method: 'GET', route: '/t' }, 1)
    const output = await register.metrics()
    expect(output).toContain('http_requests_total')
    expect(output).toContain('http_request_duration_seconds_bucket')
  })
})
