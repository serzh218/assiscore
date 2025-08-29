// @vitest-environment jsdom
import React from 'react'
import { createRoot } from 'react-dom/client'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import pricingEn from '@/i18n/en/pricing.json'

;(globalThis as any).React = React

vi.mock('@/auth', () => ({ getCurrentUser: async () => null }))
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))
vi.mock('@/components/ui', async () => {
  const actual = await vi.importActual<any>('@/components/ui')
  return {
    ...actual,
    Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  }
})
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: any) => {
    const keys = key.split('.')
    let val: any = pricingEn
    for (const k of keys) val = val?.[k]
    if (params && typeof val === 'string') {
      Object.keys(params).forEach((p) => {
        val = val.replace(`{${p}}`, params[p])
      })
    }
    return val || key
  },
}))

let PricingPage: any
beforeAll(async () => {
  PricingPage = (await import('@/app/[locale]/pricing/page')).default
})

async function renderPage() {
  const ui = await PricingPage({ params: Promise.resolve({ locale: 'en' }) })
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(ui as any)
  await new Promise((r) => setTimeout(r, 0))
  return container
}

describe('PricingPage', () => {
  it('renders plans', async () => {
    const c = await renderPage()
    expect(c.textContent).toContain('Free')
    expect(c.textContent).toContain('Pro')
    expect(c.textContent).toContain('Team')
  })
})
