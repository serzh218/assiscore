import { describe, it, expect, vi } from 'vitest'
import { sendAlert } from '../../server/obs/alerts'

describe('alerts', () => {
  it('posts to webhook', async () => {
    const fn = vi.fn().mockResolvedValue({})
    // @ts-ignore
    global.fetch = fn
    process.env.ALERT_WEBHOOK_URL = 'http://example.com'
    await sendAlert({ level: 'error', message: 'x' })
    expect(fn).toHaveBeenCalled()
  })
})
