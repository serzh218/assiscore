'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardTitle, Button, Input } from '@/components/ui'
import UpgradeBanner from '@/components/billing/UpgradeBanner'
import { useUsage } from '@/components/billing/useUsage'

export type Project = {
  id: string
  name: string
  updatedAt: string
  owner: string
  public: boolean
}

export function ProjectsList({ projects: initial }: { projects: Project[] }) {
  const t = useTranslations('projects')
  const [projects, setProjects] = useState(initial)
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [filter, setFilter] = useState<'all' | 'my' | 'recent'>('all')
  const [sortAsc, setSortAsc] = useState(false)
  const usage = useUsage()

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 250)
    return () => clearTimeout(id)
  }, [query])

  const filtered = useMemo(() => {
    let list = projects.filter((p) => p.name.toLowerCase().includes(debounced.toLowerCase()))
    if (filter === 'my') list = list.filter((p) => p.owner === 'me')
    if (filter === 'recent') {
      const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
      list = list.filter((p) => new Date(p.updatedAt).getTime() >= cutoff)
    }
    list = [...list].sort((a, b) => {
      const diff = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      return sortAsc ? diff : -diff
    })
    return list
  }, [projects, debounced, filter, sortAsc])

  const duplicate = (p: Project) => {
    const copy: Project = {
      ...p,
      id: Math.random().toString(36).slice(2),
      name: `${p.name} Copy`,
      public: true,
    }
    setProjects((prev) => [...prev, copy])
  }

  const remove = (id: string) => {
    if (!window.confirm(t('delete.confirm'))) return
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  if (projects.length === 0)
    return (
      <div className="space-y-2">
        <p>{t('empty')}</p>
        <Button>{t('create')}</Button>
      </div>
    )

  return (
    <div className="space-y-4">
      {usage &&
        usage.planCode === 'FREE' &&
        usage.quotas.privateProjects.limit - usage.quotas.privateProjects.remaining > 0 && (
          <UpgradeBanner />
        )}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder={t('search')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-40"
        />
        <div className="flex gap-1">
          {(['all', 'my', 'recent'] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'primary' : 'secondary'}
              onClick={() => setFilter(f)}
            >
              {t(`filter.${f}`)}
            </Button>
          ))}
        </div>
        <select
          className="ml-auto rounded border border-border bg-transparent p-1 text-sm"
          value={sortAsc ? 'asc' : 'desc'}
          onChange={(e) => setSortAsc(e.target.value === 'asc')}
        >
          <option value="desc">{t('sort.updatedDesc')}</option>
          <option value="asc">{t('sort.updatedAsc')}</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="space-y-2">
          <p>{t('empty')}</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="group overflow-hidden transition-transform hover:scale-[1.02] hover:shadow"
            >
              <div className="aspect-video w-full bg-gradient-to-br from-primary/20 to-transparent" />
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <p className="text-xs text-muted">{p.updatedAt}</p>
                </div>
                <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm">{t('open')}</Button>
                  <Button size="sm" variant="secondary" onClick={() => duplicate(p)}>
                    {t('duplicate')}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => remove(p.id)}>
                    {t('delete.label')}
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
