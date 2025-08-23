'use client'

import { useEffect, useState } from 'react'
import FileTree from '@/components/FileTree'
import BotEmulator from '@/components/studio/BotEmulator'
import type { SandboxData } from '@/types/sandbox'

export default function StudioPage() {
  const [sandboxId, setSandboxId] = useState<string | null>(null)
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null)
  const [fileTree, setFileTree] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [currentFile, setCurrentFile] = useState<{ path: string; content: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')
  const [projectType, setProjectType] = useState<'website' | 'application' | 'bot' | null>(null)

  useEffect(() => {
    const prepareSandbox = async () => {
      try {
        const sandboxRes = await fetch('/api/sandbox', { method: 'POST' })
        const sandboxData: SandboxData = await sandboxRes.json()

        if (!sandboxData?.sandboxId) {
          console.error('Sandbox ID не был получен')
          return
        }

        setSandboxId(sandboxData.sandboxId)
        setSandboxUrl(sandboxData.url)
        if (sandboxData.projectType) {
          setProjectType(sandboxData.projectType as 'website' | 'application' | 'bot')
        }

        try {
          const filesRes = await fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sandboxId: sandboxData.sandboxId })
          })
          const filesData = await filesRes.json()
          setFileTree(filesData)
        } catch (filesError) {
          console.error('Не удалось загрузить список файлов', filesError)
        }
      } catch (error) {
        console.error('Не удалось подготовить песочницу', error)
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
    if (!sandboxId) {
      console.error('Sandbox ID не определён')
      return
    }

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
      console.error('Не удалось прочитать файл', error)
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
          className={activeTab === 'editor' ? 'font-semibold' : ''}
          onClick={() => setActiveTab('editor')}
        >
          Редактор
        </button>
        <button
          className={activeTab === 'preview' ? 'font-semibold' : ''}
          onClick={() => setActiveTab('preview')}
        >
          Превью
        </button>
      </div>

      {activeTab === 'editor' && (
        <div className="flex gap-4">
          {fileTree && (
            <FileTree
              nodes={Array.isArray(fileTree) ? fileTree : [fileTree]}
              expanded={expanded}
              onToggle={toggle}
              onFileClick={handleFileClick}
            />
          )}
          <div className="flex-1">
            {currentFile ? (
              <>
                <h3 className="mb-2 font-medium">{currentFile.path}</h3>
                {currentFile.content ? (
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {currentFile.content}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-500">Нет содержимого для отображения</p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-500">Выберите файл из списка</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'preview' && projectType === 'bot' && sandboxId && (
        <BotEmulator sandboxId={sandboxId} />
      )}
      {activeTab === 'preview' &&
        sandboxUrl &&
        (projectType === 'website' || projectType === 'application') && (
          <iframe src={sandboxUrl} className="w-full h-[500px] border rounded" />
        )}
    </div>
  )
}
