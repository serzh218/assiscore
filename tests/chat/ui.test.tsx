// @vitest-environment jsdom
import React from 'react'
import { createRoot } from 'react-dom/client'
import { NextIntlClientProvider } from 'next-intl'
import { describe, it, expect, vi } from 'vitest'
import studioEn from '@/i18n/en/studio.json'
import ProjectChat from '@/components/chat/ProjectChat'

async function render() {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  root.render(
    <NextIntlClientProvider locale="en" messages={{ studio: studioEn }}>
      <ProjectChat projectId="p1" />
    </NextIntlClientProvider>,
  )
  await new Promise((r) => setTimeout(r, 0))
  return container
}

describe('ProjectChat UI', () => {
  it('renders history', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          messages: [
            { role: 'user', content: 'hello', createdAt: '' },
            { role: 'assistant', content: 'hi', createdAt: '' },
          ],
        }),
      }) as any,
    )
    const c = await render()
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))
    expect(c.textContent).toContain('hello')
    expect(c.textContent).toContain('hi')
  })
})
