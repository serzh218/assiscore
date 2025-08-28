'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { COSTS } from '@/lib/limits'
import {
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Textarea,
  Input,
} from '@/components/ui'
import { Paywall } from '@/components/paywall/Paywall'
import type { DeployProvider } from '@/server/integrations/deploy'

export default function ProjectPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id
  const { data: session } = useSession()
  const isPro = session?.user?.plan === 'PRO'
  const githubLinked = session?.user?.githubLinked
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [patches, setPatches] = useState<any[]>([])
  const [repoUrl, setRepoUrl] = useState<string | null>(null)
  const [showPublish, setShowPublish] = useState(false)
  const [publishStep, setPublishStep] = useState(0)
  const [deployProvider, setDeployProvider] = useState<DeployProvider>('vercel')
  const [domain, setDomain] = useState('')
  const [deployInfo, setDeployInfo] = useState<{
    deployUrl: string
    providerProjectUrl: string
    notes?: string
  } | null>(null)
  const [deployStatus, setDeployStatus] = useState<{ stepStatus: string; logs: string[] }>({
    stepStatus: 'upload',
    logs: [],
  })
  const [polling, setPolling] = useState(false)
  const [lastDeployedAt, setLastDeployedAt] = useState<Date | null>(null)
  const [genStatus, setGenStatus] = useState<string>('plan')
  const [genLogs, setGenLogs] = useState<string[]>([])
  const [showPaywall, setShowPaywall] = useState(false)
  const domainValid = !domain || /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)

  const fetchPatches = async () => {
    const res = await fetch(`/api/projects/${projectId}/patches`)
    if (res.ok) {
      const data = await res.json()
      setPatches(data.patches || [])
    }
  }

  useEffect(() => {
    const poll = setInterval(async () => {
      const res = await fetch(`/api/generate/status?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setGenStatus(data.status)
        setGenLogs(data.logs || [])
        if (data.status === 'ready') {
          clearInterval(poll)
        }
      }
    }, 1000)
    return () => clearInterval(poll)
  }, [projectId])

  useEffect(() => {
    fetchPatches()
  }, [])

  useEffect(() => {
    if (!polling) return
    const t = setInterval(async () => {
      const res = await fetch(`/api/projects/${projectId}/deploy?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setDeployStatus(data)
        if (data.stepStatus === 'done') {
          clearInterval(t)
          setPolling(false)
          setLastDeployedAt(new Date())
          toast.success('Сайт опубликован')
        }
      }
    }, 1000)
    return () => clearInterval(t)
  }, [polling, projectId])

  const send = async () => {
    setSending(true)
    try {
      await fetch(`/api/projects/${projectId}/patch`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      })
      setMessage('')
      await fetchPatches()
    } finally {
      setSending(false)
    }
  }

  const toggleDiff = async (id: string) => {
    const patch = patches.find((p) => p.id === id)
    if (!patch) return
    if (!patch.diff) {
      const res = await fetch(`/api/projects/${projectId}/patches/${id}`)
      if (res.ok) {
        const data = await res.json()
        setPatches((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, diff: data.diff, notes: data.notes, open: true } : p,
          ),
        )
      }
    } else {
      setPatches((prev) => prev.map((p) => (p.id === id ? { ...p, open: !p.open } : p)))
    }
  }

  const removePatch = async (id: string) => {
    await fetch(`/api/projects/${projectId}/patches/${id}`, { method: 'DELETE' })
    await fetchPatches()
    alert('Откат скоро появится')
  }

  const toggleVisibility = async () => {
    const newVis = visibility === 'public' ? 'private' : 'public'
    const res = await fetch(`/api/projects/${projectId}/visibility`, {
      method: 'POST',
      body: JSON.stringify({ visibility: newVis }),
    })
    if (res.status === 402) {
      setShowPaywall(true)
      return
    }
    if (res.ok) {
      setVisibility(newVis)
    }
  }

  const exportGithub = async () => {
    const res = await fetch(`/api/projects/${projectId}/export/github`, {
      method: 'POST',
      body: JSON.stringify({ visibility }),
    })
    if (res.ok) {
      const data = await res.json()
      setRepoUrl(data.repoUrl)
      toast.success(`Экспортировано в GitHub: ${data.repoUrl}`)
    }
  }

  const startDeploy = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/deploy`, {
        method: 'POST',
        body: JSON.stringify({ provider: deployProvider, domain: domain || undefined }),
      })
      if (res.ok) {
        const data = await res.json()
        setDeployInfo(data)
        setDeployStatus({ stepStatus: 'upload', logs: [] })
        setShowPublish(false)
        setPolling(true)
        toast.success('Публикация началась')
      } else {
        toast.error('Не удалось опубликовать. Проверьте логи.')
      }
    } catch {
      toast.error('Не удалось опубликовать. Проверьте логи.')
    }
  }

  return (
    <div className="space-y-6">
      <Paywall open={showPaywall} onClose={() => setShowPaywall(false)} />
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="text-display-3 font-semibold">Название проекта</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={visibility === 'public'} onChange={toggleVisibility} />
          {visibility === 'public' ? 'Публичный' : 'Приватный (PRO)'}
        </label>
        <Badge>Черновик</Badge>
        {deployInfo?.deployUrl && (
          <a href={deployInfo.deployUrl} target="_blank" className="underline text-sm">
            Опубликовано
          </a>
        )}
        {lastDeployedAt && (
          <span className="text-xs text-muted">
            обновлено {Math.round((Date.now() - lastDeployedAt.getTime()) / 60000)} минут назад
          </span>
        )}
      </div>
      <div className="text-xs text-muted">
        Публичные проекты попадают в Галерею и могут быть скопированы другими пользователями.
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative flex h-64 items-center justify-center rounded bg-border">
          {genStatus === 'ready' ? (
            <>
              <iframe
                src={`/api/projects/${projectId}/preview`}
                className="w-full h-full"
                sandbox=""
              />
              <a
                href={`/api/projects/${projectId}/preview`}
                target="_blank"
                className="absolute right-2 top-2 text-xs underline"
              >
                Открыть в новой вкладке
              </a>
            </>
          ) : (
            <div>Статус: {genStatus}</div>
          )}
        </div>
        <Tabs defaultValue="files" className="w-full">
          <TabsList>
            <TabsTrigger value="files">Файлы</TabsTrigger>
            <TabsTrigger value="chat">Чат-доработки</TabsTrigger>
            <TabsTrigger value="diffs">История/дифы</TabsTrigger>
          </TabsList>
          <TabsContent value="files">Файлы</TabsContent>
          <TabsContent value="chat">
            <div className="space-y-2">
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
              <div className="text-sm text-muted">Стоимость доработки: {COSTS.patch} токенов</div>
              <Button onClick={send} disabled={sending || !message}>
                Отправить
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="diffs">
            <ul className="space-y-2">
              {patches.map((p) => (
                <li key={p.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>
                      {new Date(p.createdAt).toLocaleString()} – {p.costTokens} токенов
                    </span>
                    <Badge variant="secondary">
                      {p.status === 'ready'
                        ? 'Готово'
                        : p.status === 'error'
                          ? 'Ошибка'
                          : 'В процессе'}
                    </Badge>
                    {p.notes && <span className="text-xs text-muted">{p.notes}</span>}
                    <Button size="sm" onClick={() => toggleDiff(p.id)}>
                      {p.open ? 'Скрыть' : 'Показать'} diff
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => removePatch(p.id)}>
                      Откатить
                    </Button>
                  </div>
                  {p.open && p.diff && (
                    <pre className="overflow-auto rounded bg-bg-elev p-2 text-xs">
                      {p.diff.split('\n').map((line: string, i: number) => (
                        <div
                          key={i}
                          className={
                            line.startsWith('+')
                              ? 'text-green-600'
                              : line.startsWith('-')
                                ? 'text-red-600'
                                : ''
                          }
                        >
                          {line}
                        </div>
                      ))}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
      <div className="h-40 overflow-auto rounded bg-bg-elev p-4 font-mono text-sm">
        {genLogs.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <Button variant="secondary">Скачать ZIP</Button>
        <div className="space-y-1">
          <Button
            variant="secondary"
            disabled={!isPro || !githubLinked}
            title={
              !isPro
                ? 'Экспорт доступен только на PRO'
                : !githubLinked
                  ? 'Подключите GitHub в настройках'
                  : undefined
            }
            onClick={exportGithub}
          >
            Экспорт в GitHub
          </Button>
          {repoUrl && <div className="text-xs text-muted break-all">{repoUrl}</div>}
        </div>
        {isPro ? (
          <Button
            variant="secondary"
            onClick={() => {
              setPublishStep(0)
              setShowPublish(true)
            }}
          >
            Опубликовать (PRO)
          </Button>
        ) : (
          <Button variant="secondary" disabled title="Публикация доступна на PRO">
            Опубликовать (PRO)
          </Button>
        )}
      </div>
      {deployInfo && (
        <div className="space-y-2">
          <div className="flex gap-4 flex-wrap">
            <a href={deployInfo.deployUrl} target="_blank" className="text-blue-500 underline">
              Открыть сайт
            </a>
            <a
              href={deployInfo.providerProjectUrl}
              target="_blank"
              className="text-blue-500 underline"
            >
              Проект у провайдера
            </a>
          </div>
          {deployInfo.notes && <div className="text-xs">{deployInfo.notes}</div>}
          <div className="max-h-40 overflow-auto rounded bg-bg-elev p-2 font-mono text-xs">
            {deployStatus.logs.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </div>
      )}
      {showPublish && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-md rounded bg-white p-4 space-y-4">
            {publishStep === 0 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Провайдер</h2>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="prov"
                    value="vercel"
                    checked={deployProvider === 'vercel'}
                    onChange={() => setDeployProvider('vercel')}
                  />
                  Vercel
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="prov"
                    value="render"
                    checked={deployProvider === 'render'}
                    onChange={() => setDeployProvider('render')}
                  />
                  Render
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="prov"
                    value="cloudflare"
                    checked={deployProvider === 'cloudflare'}
                    onChange={() => setDeployProvider('cloudflare')}
                  />
                  Cloudflare Pages
                </label>
              </div>
            )}
            {publishStep === 1 && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Домен</h2>
                <Input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                />
                <p className="text-xs text-muted">
                  Оставьте пустым — используем поддомен провайдера.
                </p>
              </div>
            )}
            {publishStep === 2 && (
              <div className="space-y-2 text-sm">
                <div>Провайдер: {deployProvider}</div>
                {domain && <div>Домен: {domain}</div>}
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowPublish(false)}>
                Отмена
              </Button>
              {publishStep > 0 && (
                <Button variant="secondary" onClick={() => setPublishStep(publishStep - 1)}>
                  Назад
                </Button>
              )}
              {publishStep < 2 && (
                <Button
                  onClick={() => setPublishStep(publishStep + 1)}
                  disabled={publishStep === 1 && !domainValid}
                >
                  Далее
                </Button>
              )}
              {publishStep === 2 && (
                <Button onClick={startDeploy} disabled={publishStep === 1 && !domainValid}>
                  Опубликовать
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
