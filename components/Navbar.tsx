import Link from 'next/link'
import { getCurrentUser } from '@/auth'
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { Button } from '@/components/ui'
import UserMenu from '@/components/UserMenu'

interface NavbarProps {
  locale: string
}

export default async function Navbar({ locale }: NavbarProps) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const user = await getCurrentUser()
  const prefix = `/${locale}`
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-black/50 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4">
        <Link href={prefix} className="font-bold text-lg">
          AssisCore
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          <Link href={prefix} className="transition-colors hover:text-primary">
            {t('nav.home')}
          </Link>
          <Link href={`${prefix}/projects`} className="transition-colors hover:text-primary">
            {t('nav.projects')}
          </Link>
          <Link href={`${prefix}/pricing`} className="transition-colors hover:text-primary">
            {t('nav.pricing')}
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          {user ? (
            <UserMenu
              user={user}
              prefix={prefix}
              profileLabel={t('nav.profile')}
              billingLabel={t('nav.billing')}
              signOutLabel={t('nav.signout')}
            />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href={`${prefix}/auth/signin`}>{t('nav.signin')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`${prefix}/auth/signup`}>{t('nav.signup')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
