'use client'

import { useEffect, useState } from 'react'
import FileTree from '@/components/FileTree'

interface SandboxResponse {
  sandboxId: string
  url: string
  [key: string]: any
}

export default function StudioPage() {
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [currentFile, setCurrentFile] = useState<{ path: string; content: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'explorer' | 'editor'>('explorer')

  useEffect(() => {
    const prepareSandbox = async () => {
      try {
        const sandboxRes = await fetch('/api/sandbox', { method: 'POST' })
        const sandboxData: SandboxResponse = await sandboxRes.json()
        setSandboxId(sandboxData.sandboxId)
        setSandboxUrl(sandboxData.url)

        const filesRes = await fetch('/api/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sandboxId: sandboxData.sandboxId })
        })
        const filesData = await filesRes.json()
        setFileTree(filesData)
      } catch (error) {
        console.error('Failed to prepare sandbox', error)
      } finally {
        setIsLoading(false)
      }
    }

    prepareSandbox()
  }, [])

  const toggle = (path: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const handleFileClick = async (path: string) => {
    if (!sandboxId) return
    try {
      const res = await fetch('/api/files/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sandboxId, path })
      })
      const data = await res.json()
      setCurrentFile({ path, content: data.content || '' })
      setActiveTab('editor')
    } catch (error) {
      console.error('Failed to read file', error)
    }
  }

  if (isLoading) {
    return <div className="p-4">Подготовка среды...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <p>Sandbox ID: {sandboxId}</p>
        {sandboxUrl && (
          <a
            href={sandboxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            Открыть песочницу
          </a>
        )}
      </div>

      <div className="flex gap-4 border-b pb-2 text-sm">
        <button
          className={activeTab === 'explorer' ? 'font-semibold' : ''}
          onClick={() => setActiveTab('explorer')}
        >
          Файлы
        </button>
        <button
          className={activeTab === 'editor' ? 'font-semibold' : ''}
          onClick={() => setActiveTab('editor')}
        >
          Редактор
        </button>
      </div>

      {activeTab === 'explorer' && fileTree && (
        <FileTree
          nodes={Array.isArray(fileTree) ? fileTree : [fileTree]}
          expanded={expanded}
          onToggle={toggle}
          onFileClick={handleFileClick}
        />
      )}

      {activeTab === 'editor' && currentFile && (
        <div>
          <h3 className="mb-2 font-medium">{currentFile.path}</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {currentFile.content}
          </pre>
        </div>
      )}
    </div>
  )
}
