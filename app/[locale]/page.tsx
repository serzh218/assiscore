'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button, Card, CardTitle } from '@/components/ui'
import { Globe, AppWindow, Bot, Plug2 } from 'lucide-react'

export default function HomePage() {
  const t = useTranslations('pages.home')
  const locale = useLocale()
  const prefix = `/${locale}`
  const features = [
    { icon: Globe, title: t('featureSites') },
    { icon: AppWindow, title: t('featureApps') },
    { icon: Bot, title: t('featureBots') },
    { icon: Plug2, title: t('featureIntegrations') },
  ]
  const steps = [t('stepDescribe'), t('stepGenerate'), t('stepEdit'), t('stepDeploy')]
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black text-white">
      <header className="px-4 py-6 text-center text-3xl font-bold">{t('title')}</header>
      <main className="flex-1 px-4">
        <section className="mt-20 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-lg text-gray-300 mb-8">{t('heroSubtitle')}</p>
          <Button asChild>
            <Link href={`${prefix}/studio`}>{t('tryFree')}</Link>
          </Button>
        </section>
        <section className="mt-32">
          <h2 className="text-2xl font-semibold mb-8 text-center">{t('whatTitle')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, idx) => (
              <Card key={idx} className="flex flex-col items-center p-6">
                <f.icon className="mb-4 h-8 w-8 text-primary" />
                <CardTitle>{f.title}</CardTitle>
              </Card>
            ))}
          </div>
        </section>
        <section className="mt-32">
          <h2 className="text-2xl font-semibold mb-8 text-center">{t('howTitle')}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Card key={i} className="p-6 text-center">
                <CardTitle>{s}</CardTitle>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="mt-24 border-t border-white/10 px-4 py-6 text-sm text-gray-400">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
          <span>© 2024 AssisCore</span>
          <div className="flex gap-4">
            <Link href={`${prefix}/studio`} className="hover:text-white">
              Студия
            </Link>
            <Link href={`${prefix}/projects`} className="hover:text-white">
              Проекты
            </Link>
            <Link href="https://github.com" className="hover:text-white">
              GitHub
            </Link>
            <Link href="mailto:info@example.com" className="hover:text-white">
              Контакты
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
