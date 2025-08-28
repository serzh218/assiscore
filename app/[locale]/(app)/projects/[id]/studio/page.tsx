import { StudioShell } from './shell'
import { ThemeToggle } from '@/components/theme-toggle'
import FileTree from '@/components/FileTree'
import { Editor } from '@/components/editor/Editor'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <div className="flex h-screen flex-col">
      <header className="h-16 border-b flex items-center px-3 gap-2">
        <div className="flex-1 font-medium">Проект #{id}</div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </header>

      <StudioShell
        left={
          <FileTree nodes={[]} expanded={new Set()} onToggle={() => {}} onFileClick={() => {}} />
        }
        center={<Editor projectId={id} />}
        right={<div>Chat</div>}
      />
    </div>
  )
}
