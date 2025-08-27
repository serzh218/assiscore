'use client'

import React, { useEffect, useRef, useState } from 'react'

interface EditorProps {
  projectId: string
  initialContent?: string
  filePath?: string
}

export function Editor({ projectId, initialContent = '', filePath = 'file.ts' }: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [ghost, setGhost] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const ws = new WebSocket(`/api/projects/${projectId}/copilot`)
    wsRef.current = ws
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse((event as MessageEvent).data)
      if (msg.type === 'suggestionChunk') {
        setGhost((g) => g + msg.text)
      } else if (msg.type === 'suggestionDone') {
        setGhost(msg.fullText)
      } else if (msg.type === 'error') {
        setGhost('')
      }
    })
    return () => {
      ws.close()
    }
  }, [projectId])

  const sendUpdate = (value: string, cursor: number) => {
    if (!wsRef.current) return
    wsRef.current.send(
      JSON.stringify({
        type: 'cursorUpdate',
        filePath,
        content: value,
        cursorLine: 0,
        cursorCol: cursor,
      }),
    )
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursor = e.target.selectionStart || 0
    setContent(value)
    setGhost('')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => sendUpdate(value, cursor), 400)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!ghost) return
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault()
      setContent((c) => c + ghost)
      setGhost('')
    } else if (e.key === 'Escape') {
      setGhost('')
    }
  }

  return (
    <div className="relative">
      <textarea
        data-testid="editor"
        value={content}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="font-mono w-full h-40"
      />
      {ghost && (
        <div
          data-testid="ghost"
          className="ghost-suggestion text-gray-500 opacity-50 pointer-events-none absolute top-0 left-0 whitespace-pre-wrap"
        >
          {content}
          {ghost}
        </div>
      )}
    </div>
  )
}
