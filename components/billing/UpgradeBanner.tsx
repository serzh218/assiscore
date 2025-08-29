'use client'
import React from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useUsage } from './useUsage'

export default function UpgradeBanner({ className = '' }: { className?: string }) {
  const usage = useUsage()
  const tBilling = useTranslations('billing')
  const tPaywall = useTranslations('paywall.banner')
  const locale = useLocale()
  if (!usage) return null
  const tokensUsed = usage.quotas.tokens.limit - usage.quotas.tokens.remaining
  const tokensPct = usage.quotas.tokens.limit > 0 ? tokensUsed / usage.quotas.tokens.limit : 0
  const projUsed = usage.quotas.privateProjects.limit - usage.quotas.privateProjects.remaining
  const projPct =
    usage.quotas.privateProjects.limit > 0 ? projUsed / usage.quotas.privateProjects.limit : 0
  const limitReached = usage.quotas.tokens.remaining <= 0
  const show = usage.planCode === 'FREE' || tokensPct > 0.9 || projPct > 0.9 || limitReached
  if (!show) return null
  return (
    <div className={`bg-primary text-primary-fore p-4 text-center ${className}`}>
      <span>{limitReached ? tPaywall('limitReached') : tBilling('upgrade.banner.title')}</span>{' '}
      <Link href={`/${locale}/pricing`} className="underline font-semibold">
        {limitReached ? tPaywall('upgradeCta') : tBilling('upgrade.banner.cta')}
      </Link>
    </div>
  )
}
