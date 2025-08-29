'use client'
import React from 'react'
import clsx from 'clsx'
import { useTranslations } from 'next-intl'
import { useUsage } from './useUsage'

export default function UsageMeter() {
  const usage = useUsage()
  const t = useTranslations('billing.usageMeter')
  if (!usage) return null

  const items = [
    {
      label: t('usage.tokens'),
      used: usage.quotas.tokens.limit - usage.quotas.tokens.remaining,
      limit: usage.quotas.tokens.limit,
    },
    {
      label: t('usage.projects'),
      used: usage.quotas.privateProjects.limit - usage.quotas.privateProjects.remaining,
      limit: usage.quotas.privateProjects.limit,
    },
  ]

  const reset = usage.periodEnd ? new Date(usage.periodEnd).toISOString().slice(0, 10) : null

  const color = (pct: number) => {
    if (pct < 0.7) return 'bg-green-500'
    if (pct < 0.9) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="text-xs">
      {items.map((it) => {
        const pct = it.limit > 0 ? it.used / it.limit : 0
        return (
          <div key={it.label} className="mb-1 w-40">
            <div className="flex justify-between">
              <span>{it.label}</span>
              <span>
                {it.used}/{it.limit}
              </span>
            </div>
            <div className="h-1 w-full rounded bg-bg-elev">
              <div
                className={clsx('h-full rounded', color(pct))}
                style={{ width: `${pct * 100}%` }}
              />
            </div>
          </div>
        )
      })}
      {reset && <p className="text-muted">{t('usage.resetsAt', { date: reset })}</p>}
    </div>
  )
}
