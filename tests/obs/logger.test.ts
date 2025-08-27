import { describe, expect, it } from 'vitest'
import { createLogger } from '../../server/obs/logger'
import pino from 'pino'

describe('logger', () => {
  it('outputs json', () => {
    const dest = pino.destination({ sync: true })
    const logs: string[] = []
    dest.write = (chunk: any) => {
      logs.push(chunk.toString())
    }
    const log = createLogger(dest)
    log.info('hello')
    const parsed = JSON.parse(logs[0])
    expect(parsed.msg).toBe('hello')
    expect(typeof parsed.level).toBe('number')
  })
})
