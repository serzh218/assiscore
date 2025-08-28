'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button, Input, Select, Card } from '@/components/ui'

interface ChatMessage {
  role: string
  content: string
  createdAt: string
}

interface Props {
  projectId: string
}

export default function ProjectChat({ projectId }: Props) {
  const t = useTranslations('studio.chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [mode, setMode] = useState('default')
  const [offset, setOffset] = useState(0)
  const endRef = useRef<HTMLDivElement>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const load = async (more = false) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/chat?limit=20&offset=${more ? offset : 0}`,
      )
      const data = await res.json()
      if (more) {
        setMessages((m) => [...data.messages, ...m])
        setOffset(offset + data.messages.length)
      } else {
        setMessages(data.messages)
        setOffset(data.messages.length)
      }
    } catch (e) {
      // ignore in tests
    }
  }
  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (endRef.current && typeof (endRef.current as any).scrollIntoView === 'function') {
      endRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const send = async () => {
    if (!text.trim()) return
    const res = await fetch(`/api/projects/${projectId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, mode }),
    })
    const data = await res.json()
    setMessages(data.messages)
    setText('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setText(v)
    setShowShortcuts(v.startsWith('/'))
  }

  const shortcuts = [
    { key: '/explain', mode: 'explain', label: t('shortcut.explain') },
    { key: '/refactor', mode: 'refactor', label: t('shortcut.refactor') },
    { key: '/tests', mode: 'tests', label: t('shortcut.tests') },
  ]

  const applyShortcut = (m: string) => {
    setMode(m)
    setText('')
    setShowShortcuts(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        <button className="mx-auto mb-2 text-sm text-muted" onClick={() => load(true)}>
          {t('loadOlder')}
        </button>
        {messages
          .filter((m) => m.role !== 'system')
          .map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'assistant' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                {m.role === 'user' && <div className="h-6 w-6 rounded-full bg-primary" />}
                <div className="rounded-md bg-bg-elev p-2 text-sm whitespace-pre-wrap">
                  {m.content}
                </div>
                {m.role === 'assistant' && <div className="h-6 w-6 rounded-full bg-secondary" />}
              </div>
            </div>
          ))}
        <div ref={endRef} />
      </div>
      <div className="border-t border-border p-2 space-y-2">
        <Select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="default">{t('modes.default')}</option>
          <option value="explain">{t('modes.explain')}</option>
          <option value="refactor">{t('modes.refactor')}</option>
          <option value="tests">{t('modes.tests')}</option>
        </Select>
        <div className="flex gap-2">
          <Input value={text} onChange={handleChange} placeholder={t('placeholder')} />
          <Button onClick={send}>{t('send')}</Button>
        </div>
        {showShortcuts && (
          <Card className="p-2">
            {shortcuts.map((s) => (
              <div key={s.key}>
                <button
                  className="w-full text-left text-sm hover:underline"
                  onClick={() => applyShortcut(s.mode)}
                >
                  {s.key} — {s.label}
                </button>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  )
}
