'use client'

import { useState } from 'react'
import { Card, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui'
import {
  Files as FilesIcon,
  MessageSquare,
  GitMerge,
  Clock,
  Settings,
  Bell,
  FileCode,
  FileJson,
  FileImage,
  File as FileIcon,
} from 'lucide-react'
import UsageMeter from '@/components/billing/UsageMeter'
import UpgradeBanner from '@/components/billing/UpgradeBanner'

const files = [
  { name: 'index.ts', ext: 'ts' },
  { name: 'app.tsx', ext: 'tsx' },
  { name: 'data.json', ext: 'json' },
  { name: 'logo.png', ext: 'png' },
]

export default function StudioPage() {
  const [active, setActive] = useState('files')
  return (
    <div className="flex h-screen bg-bg text-text">
      <aside className="flex w-16 flex-col items-center border-r border-border bg-bg-elev py-4 space-y-4">
        {[
          { id: 'files', icon: FilesIcon },
          { id: 'chat', icon: MessageSquare },
          { id: 'diff', icon: GitMerge },
          { id: 'versions', icon: Clock },
          { id: 'settings', icon: Settings },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`p-2 rounded-xl transition-colors ${
              active === item.id ? 'bg-primary text-primary-fore' : 'text-muted hover:bg-bg'
            }`}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <h2 className="text-lg font-semibold">My Project</h2>
          <div className="flex items-center gap-4">
            <UsageMeter />
            <Bell className="h-5 w-5" />
            <div className="h-8 w-8 rounded-full bg-primary" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs value={active} onValueChange={setActive}>
            <TabsList>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="diff">Diff</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
            <TabsContent value="files">
              <Card className="p-4 space-y-1">
                {files.map((f) => (
                  <div key={f.name} className="flex items-center gap-2">
                    {getFileIcon(f.ext)}
                    <span>{f.name}</span>
                  </div>
                ))}
              </Card>
            </TabsContent>
            <TabsContent value="diff">
              <Card className="p-4 text-center text-muted">No diff</Card>
            </TabsContent>
            <TabsContent value="chat">
              <Card className="p-4 text-center text-muted">Chat coming soon</Card>
            </TabsContent>
            <TabsContent value="versions">
              <Card className="p-4 text-center text-muted">No versions</Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <UpgradeBanner className="fixed bottom-0 left-0 right-0" />
    </div>
  )
}

function getFileIcon(ext: string) {
  switch (ext) {
    case 'ts':
    case 'tsx':
    case 'js':
      return <FileCode className="h-4 w-4 text-primary" />
    case 'json':
      return <FileJson className="h-4 w-4 text-primary" />
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <FileImage className="h-4 w-4 text-primary" />
    default:
      return <FileIcon className="h-4 w-4 text-primary" />
  }
}
