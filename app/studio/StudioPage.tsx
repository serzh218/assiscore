'use client'

import { useEffect, useState } from 'react'

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

  if (isLoading) {
    return <div className="p-4">Подготовка среды...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <p>Sandbox ID: {sandboxId}</p>
        {sandboxUrl && (
          <a href={sandboxUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            Открыть песочницу
          </a>
        )}
      </div>
      {fileTree && (
        <pre className="text-xs bg-gray-100 p-2 rounded">{JSON.stringify(fileTree, null, 2)}</pre>
      )}
    </div>
  )
}
