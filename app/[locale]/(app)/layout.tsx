import type { ReactNode } from 'react'
import Link from 'next/link'
import '@/styles/tokens.css'
import '@/styles/animations.css'
import { getCurrentUser } from '@/auth'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { formatTokens } from '@/lib/i18n/format'

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'common' })
  const user = await getCurrentUser()
  const prefix = `/${locale}`
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
          <Link href={prefix} className="font-bold">
            {t('appName')}
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href={`${prefix}/studio`} className="hover:text-primary transition-colors">
              {t('nav.studio')}
            </Link>
            <Link href={`${prefix}/projects`} className="hover:text-primary transition-colors">
              {t('nav.projects')}
            </Link>
            <Link href={`${prefix}/explore`} className="hover:text-primary transition-colors">
              {t('nav.explore')}
            </Link>
            <Link href={`${prefix}/billing`} className="hover:text-primary transition-colors">
              {t('nav.billing')}
            </Link>
            <Link href={`${prefix}/settings`} className="hover:text-primary transition-colors">
              {t('nav.settings')}
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {user ? (
              <div className="text-sm text-muted">
                {t('plan', { plan: user.plan, tokens: formatTokens(user.tokens, locale as any) })}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted">
                <span>{t('auth.guest')}</span>
                <Link href={`${prefix}/auth/sign-in`} className="text-primary hover:underline">
                  {t('auth.signIn')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8">{children}</main>
    </div>
  )
}
