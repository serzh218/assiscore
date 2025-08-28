'use client'

import Link from 'next/link'
import { Card, CardContent, CardTitle, Button } from '@/components/ui'

const projects = [
  { id: '1', name: 'Project A', updated: '2024-01-01' },
  { id: '2', name: 'Project B', updated: '2024-02-15' },
]

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      {projects.length === 0 ? (
        <div className="space-y-2">
          <p>У вас пока нет проектов</p>
          <Button>Создать сайт</Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="group overflow-hidden">
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-transparent" />
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <p className="text-xs text-muted">{p.updated}</p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" asChild>
                    <Link href={`/projects/${p.id}`}>Открыть</Link>
                  </Button>
                  <Button size="sm" variant="secondary">
                    Копировать
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
