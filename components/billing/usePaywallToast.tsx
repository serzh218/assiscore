'use client'
import React from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { toast } from 'sonner'
import { useCallback } from 'react'

export function usePaywallToast() {
  const t = useTranslations('billing')
  const locale = useLocale()
  return useCallback(() => {
    toast.error(
      <div className="flex items-center gap-2">
        <span>{t('upgrade.toast.limitReached')}</span>
        <Link href={`/${locale}/pricing`} className="underline">
          {t('upgrade.banner.cta')}
        </Link>
      </div>,
    )
  }, [t, locale])
}

export function handlePaywall(res: Response, show: () => void) {
  if (res.status === 402) show()
}
