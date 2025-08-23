'use client'

import { useEffect, useState } from 'react'
import FileTree from '@/components/FileTree'
import BotEmulator from '@/components/studio/BotEmulator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  const [showExportModal, setShowExportModal] = useState(false)
  const [repoName, setRepoName] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [exporting, setExporting] = useState(false)
  const [repoUrl, setRepoUrl] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

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

  const handleExport = async () => {
    if (!repoName || !githubToken) return
    setExporting(true)
    setExportError(null)
    try {
      const zipRes = await fetch('/api/create-zip', { method: 'POST' })
      const zipData = await zipRes.json()
      if (!zipData?.dataUrl) {
        throw new Error(zipData?.error || 'Не удалось создать архив')
      }
      const res = await fetch('/api/export/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: githubToken, repoName, zipData: zipData.dataUrl })
      })
      const data = await res.json()
      if (!data?.url) {
        throw new Error(data?.error || 'Не удалось экспортировать')
      }
      setRepoUrl(data.url)
      setShowExportModal(false)
    } catch (error) {
      console.error('Export failed', error)
      setExportError((error as Error).message)
    } finally {
      setExporting(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">Подготовка среды...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
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
        <Button onClick={() => setShowExportModal(true)}>Экспорт в GitHub</Button>
        {repoUrl && (
          <p>
            Репозиторий:{' '}
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              {repoUrl}
            </a>
          </p>
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

      {activeTab === 'preview' && projectType === 'bot' && sandboxId ? (
        <BotEmulator sandboxId={sandboxId} />
      ) : null}
      {activeTab === 'preview' &&
        sandboxUrl &&
        (projectType === 'website' || projectType === 'application') && (
          <iframe src={sandboxUrl} className="w-full h-[500px] border rounded" />
        )}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-card p-4 rounded w-96 space-y-4">
            <h2 className="text-lg font-semibold">Экспорт в GitHub</h2>
            <div className="space-y-2">
              <Label htmlFor="repoName">Имя репозитория</Label>
              <Input
                id="repoName"
                value={repoName}
                onChange={e => setRepoName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubToken">GitHub Token</Label>
              <Input
                id="githubToken"
                type="password"
                value={githubToken}
                onChange={e => setGithubToken(e.target.value)}
              />
            </div>
            {exportError && <p className="text-sm text-red-500">{exportError}</p>}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                disabled={exporting}
              >
                Отмена
              </Button>
              <Button onClick={handleExport} disabled={exporting}>
                {exporting ? 'Экспорт...' : 'Экспорт'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
