// @vitest-environment jsdom
import React from 'react'
import { createRoot } from 'react-dom/client'
import { NextIntlClientProvider } from 'next-intl'
import { describe, it, expect, vi, afterEach } from 'vitest'
import billingEn from '@/i18n/en/billing.json'
import pricingEn from '@/i18n/en/pricing.json'
import BillingPage from '@/app/[locale]/account/billing/page'

vi.mock('@/auth', () => ({ getCurrentUser: async () => ({ id: 'u1', plan: 'PRO' }) }))
vi.mock('@/lib/db', () => ({
  prisma: {
    subscription: {
      findFirst: vi
        .fn()
        .mockResolvedValue({ status: 'active', currentPeriodEnd: '2024-01-01T00:00:00Z' }),
    },
  },
}))

afterEach(() => {
  vi.restoreAllMocks()
})

async function renderPage() {
  vi.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({
      planCode: 'PRO',
      quotas: {
        tokens: { remaining: 80, limit: 100 },
        privateProjects: { remaining: 5, limit: 10 },
      },
      periodEnd: '2024-01-01T00:00:00Z',
    }),
  } as any)
  const ui = await BillingPage({ params: Promise.resolve({ locale: 'en' }) })
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <NextIntlClientProvider locale="en" messages={{ billing: billingEn, pricing: pricingEn }}>
      {ui as any}
    </NextIntlClientProvider>,
  )
  await new Promise((r) => setTimeout(r, 0))
  return container
}

describe('BillingPage', () => {
  it('shows current plan and usage', async () => {
    const c = await renderPage()
    expect(c.textContent).toContain('Current plan')
    expect(c.textContent).toContain('80/100')
  })
})
