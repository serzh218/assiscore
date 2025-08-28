// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { createRoot } from 'react-dom/client'
import { NextIntlClientProvider } from 'next-intl'
import copilotEn from '@/i18n/en/copilot.json'
import { Editor } from '@/components/editor/Editor'

describe('editor ghost text', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('renders and accepts/dismisses', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        json: async () => ({ suggestions: [{ text: 'lo', kind: 'inline' }] }),
      } as any)
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) } as any)
      .mockResolvedValueOnce({
        json: async () => ({ suggestions: [{ text: '!' }] }),
      } as any)
      .mockResolvedValueOnce({ json: async () => ({ ok: true }) } as any)

    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(
      <NextIntlClientProvider locale="en" messages={{ copilot: copilotEn }}>
        <Editor projectId="p1" initialContent="hel" projectFiles={['file.ts']} />
      </NextIntlClientProvider>,
    )
    await new Promise((r) => setTimeout(r, 0))

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = 'hel'
    textarea.selectionStart = textarea.selectionEnd = 3
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', ctrlKey: true, bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))

    let ghost = container.querySelector('[data-testid="ghost"]') as HTMLElement
    expect(ghost.textContent).toContain('lo')
    expect(ghost.className).toContain('text-gray-500')
    expect(ghost.className).toContain('opacity-50')

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toBe('hello')
    expect(container.querySelector('[data-testid="ghost"]')).toBeNull()

    // trigger another suggestion
    textarea.value = 'hello'
    textarea.selectionStart = textarea.selectionEnd = 5
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', ctrlKey: true, bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    ghost = container.querySelector('[data-testid="ghost"]') as HTMLElement
    expect(ghost.textContent).toContain('!')

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(container.querySelector('[data-testid="ghost"]')).toBeNull()

    const acceptedBody = JSON.parse(fetchMock.mock.calls[1][1].body as string)
    expect(acceptedBody.action).toBe('accepted')
    const rejectedBody = JSON.parse(fetchMock.mock.calls[3][1].body as string)
    expect(rejectedBody.action).toBe('rejected')
  })
})
