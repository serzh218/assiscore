import { listPlans, type PlanWithFeatures } from '@/server/billing/plans'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Button } from '@/components/ui'
import { useTranslations } from 'next-intl'

function PlanFeatures({ features }: { features: PlanWithFeatures['features'] }) {
  const t = useTranslations('pricing')
  return (
    <ul className="space-y-1 text-sm">
      <li>
        {t('features.genPerMonth')}: {features.genPerMonth}
      </li>
      <li>
        {t('features.privateProjects')}: {features.privateProjects}
      </li>
      <li>
        {t('features.githubExport')}: {features.githubExport ? t('yes') : t('no')}
      </li>
      <li>
        {t('features.deploy')}: {features.deploy ? t('yes') : t('no')}
      </li>
      <li>
        {t('features.monthlyTokens')}: {features.monthlyTokens}
      </li>
      <li>
        {t('features.assistantCallsPerHour')}: {features.assistantCallsPerHour}
      </li>
      <li>
        {t('features.testFirstCyclesPerMonth')}: {features.testFirstCyclesPerMonth}
      </li>
    </ul>
  )
}

function SelectButton({ plan }: { plan: PlanWithFeatures }) {
  'use client'
  const t = useTranslations('pricing')
  const handleClick = async () => {
    if (plan.priceCents === 0) {
      await fetch('/api/billing/free', { method: 'POST' })
      window.location.reload()
    } else {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.code }),
      })
      const data = await res.json()
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl as string
      }
    }
  }
  return <Button onClick={handleClick}>{t('select')}</Button>
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = useTranslations('pricing')
  const plans = await listPlans()
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const priceFormatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: plan.currency,
        })
        const price =
          plan.priceCents === 0 ? t('free') : priceFormatter.format(plan.priceCents / 100)
        return (
          <Card key={plan.code} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.code}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="text-2xl font-bold">{price}</div>
              <PlanFeatures features={plan.features} />
            </CardContent>
            <CardFooter>
              <SelectButton plan={plan} />
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
