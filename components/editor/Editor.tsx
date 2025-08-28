'use client'

import React, { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/Toast'

interface EditorProps {
  projectId: string
  initialContent?: string
  filePath?: string
  projectFiles?: string[]
}

export function Editor({
  projectId,
  initialContent = '',
  filePath = 'file.ts',
  projectFiles = [],
}: EditorProps) {
  const [content, setContent] = useState(initialContent)
  const [ghost, setGhost] = useState('')
  const [accepted, setAccepted] = useState(false)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const t = useTranslations('copilot')

  const fetchSuggestion = async (value: string, cursor: number) => {
    toast(t('suggesting'))
    const prefix = value.slice(0, cursor)
    const suffix = value.slice(cursor)
    const imports = Array.from(value.matchAll(/import\s.+?from\s+['\"](.*)['\"]/g)).map((m) => m[1])
    try {
      const res = await fetch(`/api/projects/${projectId}/copilot/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath,
          content: value,
          cursorLine: 0,
          cursorColumn: cursor,
          prefix,
          suffix,
          imports,
          files: projectFiles,
        }),
      })
      const data = await res.json()
      if (data.suggestions && data.suggestions[0]) {
        setGhost(data.suggestions[0].text)
      } else {
        toast(t('noSuggestions'))
      }
    } catch {
      toast(t('noSuggestions'))
    }
  }

  const schedule = (value: string, cursor: number) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => fetchSuggestion(value, cursor), 500)
  }

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    const cursor = e.target.selectionStart || 0
    setContent(value)
    setGhost('')
    schedule(value, cursor)
  }

  const logAction = (action: string, text: string) => {
    fetch(`/api/projects/${projectId}/copilot/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, action, text }),
    })
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab' && ghost) {
      e.preventDefault()
      const g = ghost
      const textarea = e.currentTarget
      const start = textarea.selectionStart || 0
      const end = textarea.selectionEnd || start
      setContent((c) => c.slice(0, start) + g + c.slice(end))
      setGhost('')
      setAccepted(true)
      setTimeout(() => setAccepted(false), 200)
      logAction('accepted', g)
      toast(t('accepted'))
    } else if (e.key === 'Escape' && ghost) {
      const g = ghost
      setGhost('')
      logAction('rejected', g)
      toast(t('rejected'))
    } else if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault()
      const textarea = e.currentTarget
      const value = textarea.value
      const cursor = textarea.selectionStart || 0
      setGhost('')
      fetchSuggestion(value, cursor)
    }
  }

  return (
    <div className="relative">
      <textarea
        data-testid="editor"
        value={content}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className={`font-mono w-full h-40 bg-transparent relative z-10 ${accepted ? 'fade-in' : ''}`}
      />
      {ghost && (
        <div
          data-testid="ghost"
          className="ghost-suggestion text-gray-500 opacity-50 pointer-events-none absolute top-0 left-0 whitespace-pre-wrap z-0"
        >
          {content}
          {ghost}
        </div>
      )}
    </div>
  )
}
