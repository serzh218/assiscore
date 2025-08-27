// @vitest-environment jsdom

import React from 'react'
import { describe, it, beforeEach, expect } from 'vitest'
import { createRoot } from 'react-dom/client'
import { Editor } from '@/components/editor/Editor'

class MockWS extends EventTarget {
  lastSent: any = null
  send(data: any) {
    this.lastSent = data
  }
  close() {}
}

let socket: MockWS

beforeEach(() => {
  ;(global as any).WebSocket = class extends MockWS {
    constructor(url: string) {
      super()
      socket = this
    }
  } as any
})

describe('editor ghost text', () => {
  it('renders and accepts/dismisses', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    root.render(<Editor projectId="p1" initialContent="hel" />)
    await new Promise((r) => setTimeout(r, 0))
    await new Promise((r) => setTimeout(r, 0))

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    socket.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({ type: 'suggestionChunk', text: 'lo' }),
      }),
    )
    socket.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({ type: 'suggestionDone', fullText: 'lo' }),
      }),
    )
    await new Promise((r) => setTimeout(r, 0))
    let ghost = container.querySelector('[data-testid="ghost"]') as HTMLElement
    expect(ghost.textContent).toContain('lo')
    expect(ghost.className).toContain('text-gray-500')
    expect(ghost.className).toContain('opacity-50')

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))

    expect((container.querySelector('textarea') as HTMLTextAreaElement).value).toBe('hello')
    expect(container.querySelector('[data-testid="ghost"]')).toBeNull()

    socket.dispatchEvent(
      new MessageEvent('message', { data: JSON.stringify({ type: 'suggestionChunk', text: '!' }) }),
    )
    socket.dispatchEvent(
      new MessageEvent('message', {
        data: JSON.stringify({ type: 'suggestionDone', fullText: '!' }),
      }),
    )
    await new Promise((r) => setTimeout(r, 0))
    ghost = container.querySelector('[data-testid="ghost"]') as HTMLElement
    expect(ghost.textContent).toContain('!')

    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await new Promise((r) => setTimeout(r, 0))
    expect(container.querySelector('[data-testid="ghost"]')).toBeNull()
  })
})
