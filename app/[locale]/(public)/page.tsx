import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Button, Card } from '@/components/ui'
import { Globe, AppWindow, Bot, Plug2 } from 'lucide-react'
import { FaGithub, FaFigma, FaDocker } from 'react-icons/fa'

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing' })
  const prefix = `/${locale}`

  const features = [
    { icon: Globe, title: t('features.sites') },
    { icon: AppWindow, title: t('features.apps') },
    { icon: Bot, title: t('features.bots') },
    { icon: Plug2, title: t('features.integrations') },
  ]

  const steps = [t('how.step1'), t('how.step2'), t('how.step3'), t('how.step4')]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/20 to-transparent" />
        <div className="mx-auto max-w-6xl px-4 py-28 text-center">
          <h1 className="text-display-1 font-bold">{t('hero.title')}</h1>
          <p className="mt-4 text-lg text-muted">{t('hero.subtitle')}</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href={`${prefix}/studio`}>{t('hero.ctaPrimary')}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href={`${prefix}/projects`}>{t('hero.ctaSecondary')}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="mb-10 text-display-3 font-semibold">{t('features.title')}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title }) => (
            <Card key={title} className="p-6 shadow-sm hover:shadow-lg flex flex-col items-center">
              <Icon className="mb-4 h-10 w-10 text-primary" aria-hidden="true" />
              <p className="font-medium">{title}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="mb-10 text-display-3 font-semibold">{t('how.title')}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <Card key={idx} className="p-6 shadow-sm hover:shadow-lg flex flex-col items-center">
              <span className="mb-2 text-2xl font-bold text-primary">{idx + 1}</span>
              <p>{s}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="mb-4 text-display-3 font-semibold">{t('trust.title')}</h2>
        <p className="mb-8 text-muted">{t('trust.integrations')}</p>
        <div className="flex justify-center gap-12 text-4xl">
          <FaGithub aria-label="GitHub" />
          <FaFigma aria-label="Figma" />
          <FaDocker aria-label="Docker" />
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="mb-6 text-display-2 font-bold">{t('cta.title')}</h2>
        <Button asChild size="lg">
          <Link href={`${prefix}/studio`}>{t('cta.button')}</Link>
        </Button>
        <p className="mt-4 text-sm text-muted">{t('cta.note')}</p>
      </section>
    </div>
  )
}
