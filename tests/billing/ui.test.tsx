// @vitest-environment jsdom
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { NextIntlClientProvider } from 'next-intl'
import { describe, it, expect, vi, afterEach } from 'vitest'
import billingEn from '@/i18n/en/billing.json'
import paywallEn from '@/i18n/en/paywall.json'
import UsageMeter from '@/components/billing/UsageMeter'
import UpgradeBanner from '@/components/billing/UpgradeBanner'
import { usePaywallToast, handlePaywall } from '@/components/billing/usePaywallToast'
import { toast } from 'sonner'

async function render(ui: React.ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <NextIntlClientProvider locale="en" messages={{ billing: billingEn, paywall: paywallEn }}>
      {ui}
    </NextIntlClientProvider>,
  )
  await new Promise((r) => setTimeout(r, 0))
  return container
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('UsageMeter', () => {
  it('renders progress', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        planCode: 'PRO',
        quotas: {
          tokens: { remaining: 50, limit: 100 },
          privateProjects: { remaining: 1, limit: 10 },
        },
        periodEnd: '2024-01-01T00:00:00Z',
      }),
    } as any)
    const c = await render(<UsageMeter />)
    expect(c.textContent).toContain('50/100')
    expect(c.textContent).toContain('9/10')
  })
})

describe('UpgradeBanner', () => {
  it('shows for free plan', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        planCode: 'FREE',
        quotas: {
          tokens: { remaining: 100, limit: 100 },
          privateProjects: { remaining: 0, limit: 0 },
        },
        periodEnd: null,
      }),
    } as any)
    const c = await render(<UpgradeBanner />)
    expect(c.textContent).toContain('Upgrade to PRO/TEAM')
  })
  it('shows when usage high', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        planCode: 'PRO',
        quotas: {
          tokens: { remaining: 5, limit: 100 },
          privateProjects: { remaining: 1, limit: 10 },
        },
        periodEnd: null,
      }),
    } as any)
    const c = await render(<UpgradeBanner />)
    expect(c.textContent).toContain('Upgrade to PRO/TEAM')
  })
  it('shows limit reached', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        planCode: 'PRO',
        quotas: {
          tokens: { remaining: 0, limit: 100 },
          privateProjects: { remaining: 1, limit: 10 },
        },
        periodEnd: null,
      }),
    } as any)
    const c = await render(<UpgradeBanner />)
    expect(c.textContent).toContain('Your limit is reached')
  })
  it('hides otherwise', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        planCode: 'PRO',
        quotas: {
          tokens: { remaining: 80, limit: 100 },
          privateProjects: { remaining: 5, limit: 10 },
        },
        periodEnd: null,
      }),
    } as any)
    const c = await render(<UpgradeBanner />)
    expect(c.textContent).toBe('')
  })
})

describe('paywall toast', () => {
  it('triggers toast on paywall', async () => {
    const spy = vi.spyOn(toast, 'error')
    function Comp() {
      const show = usePaywallToast()
      useEffect(() => {
        handlePaywall(new Response('', { status: 402 }), show)
      }, [show])
      return null
    }
    await render(<Comp />)
    expect(spy).toHaveBeenCalled()
  })
})
