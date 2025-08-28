'use client'
import * as React from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import { cn } from '@/lib/utils'

export function StudioShell({
  left,
  center,
  right,
}: {
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
}) {
  const [sizes, setSizes] = useLocalStorage<number[]>('studio:sizes', [20, 60, 20])
  return (
    <PanelGroup
      direction="horizontal"
      className="h-[calc(100vh-64px)]"
      onLayout={setSizes}
      data-testid="studio-shell"
    >
      <Panel defaultSize={sizes[0]} minSize={15}>
        <div className="h-full border-r p-2">{left}</div>
      </Panel>
      <PanelResizeHandle
        className={cn(
          'w-[6px] bg-border hover:bg-primary/30 transition-colors',
          'active:bg-primary/50 cursor-col-resize',
        )}
        data-testid="resize-handle"
      />
      <Panel defaultSize={sizes[1]} minSize={40}>
        <div className="h-full">{center}</div>
      </Panel>
      <PanelResizeHandle
        className="w-[6px] bg-border hover:bg-primary/30 transition-colors active:bg-primary/50 cursor-col-resize"
        data-testid="resize-handle"
      />
      <Panel defaultSize={sizes[2]} minSize={15}>
        <div className="h-full border-l p-2">{right}</div>
      </Panel>
    </PanelGroup>
  )
}
