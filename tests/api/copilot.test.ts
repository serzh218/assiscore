import { describe, it, expect, vi } from 'vitest'

vi.mock('@/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}))

vi.mock('@/server/guards/acl', () => ({
  assertProjectPermission: vi.fn(async () => {}),
}))

const log = vi.fn()
vi.mock('@/server/repo/copilot', () => ({
  logCopilotEvent: (data: any) => log(data),
}))

describe('copilot API', () => {
  it('returns mock suggestion and logs', async () => {
    const { POST } = await import('@/app/api/projects/[id]/copilot/suggest/route')
    const body = {
      filePath: 'f.ts',
      content: 'import x from "y"',
      cursorLine: 0,
      cursorColumn: 0,
      prefix: '',
      suffix: '',
      imports: ['y'],
      files: ['f.ts'],
    }
    const res = await POST(
      new Request('http://test', { method: 'POST', body: JSON.stringify(body) }),
      { params: { id: 'p1' } } as any,
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.suggestions[0].text).toBe("console.log('Hello CoPilot!')")
    expect(log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'suggested', projectId: 'p1' }),
    )
  })

  it('logs event', async () => {
    const { POST } = await import('@/app/api/projects/[id]/copilot/event/route')
    const res = await POST(
      new Request('http://test', {
        method: 'POST',
        body: JSON.stringify({ filePath: 'f.ts', action: 'accepted', text: 'hi' }),
      }),
      { params: { id: 'p1' } } as any,
    )
    expect(res.status).toBe(200)
    expect(log).toHaveBeenCalledWith(expect.objectContaining({ action: 'accepted', text: 'hi' }))
  })
})
