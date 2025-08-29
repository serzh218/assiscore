import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import middleware from '@/middleware'
import { getToken } from 'next-auth/jwt'

vi.mock('next-intl/middleware', () => ({ default: () => () => new Response(null) }))
vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }))

describe('auth middleware', () => {
  it('redirects unauthenticated to signin with next', async () => {
    ;(getToken as any).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/en/studio')
    const res = await middleware(req)
    expect(res.headers.get('location')).toBe('http://localhost/en/auth/signin?next=%2Fen%2Fstudio')
  })

  it('allows authenticated users', async () => {
    ;(getToken as any).mockResolvedValue({})
    const req = new NextRequest('http://localhost/en/studio')
    const res = await middleware(req)
    expect(res.headers.get('location')).toBeNull()
  })
})
