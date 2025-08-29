import Link from 'next/link'
import { getCurrentUser } from '@/auth'
import { listPlans } from '@/server/billing/plans'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Button } from '@/components/ui'
import { useTranslations } from 'next-intl'

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = useTranslations('pricing')
  const user = await getCurrentUser()
  const plans = await listPlans()

  const supports: Record<string, string> = {
    FREE: t('plan.support.none'),
    PRO: t('plan.support.email'),
    TEAM: t('plan.support.priority'),
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => {
          const priceFormatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: plan.currency,
          })
          const price =
            plan.priceCents === 0
              ? t('plan.price.free')
              : t('plan.price.perMonth', {
                  price: priceFormatter.format(plan.priceCents / 100),
                })
          return (
            <Card key={plan.code} className="flex flex-col">
              <CardHeader>
                <CardTitle>{t(`plan.${plan.code.toLowerCase()}`)}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <div className="text-2xl font-bold">{price}</div>
                <ul className="space-y-1 text-sm">
                  <li>
                    {t('plan.feature.projects')}: {plan.features.privateProjects}
                  </li>
                  <li>
                    {t('plan.feature.tokens')}: {plan.features.monthlyTokens}
                  </li>
                  <li>
                    {t('plan.feature.support')}: {supports[plan.code]}
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild>
                  <Link
                    href={
                      user
                        ? `/account/billing?plan=${plan.code.toLowerCase()}`
                        : `/auth/signin?next=/${locale}/pricing`
                    }
                  >
                    {t('select')}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
