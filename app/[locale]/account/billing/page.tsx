import Link from 'next/link'
import { getCurrentUser } from '@/auth'
import { prisma } from '@/lib/db'
import { getPlan } from '@/server/billing/plans'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui'
import { useTranslations } from 'next-intl'
import UsageMeter from '@/components/billing/UsageMeter'

function CancelButton() {
  'use client'
  const t = useTranslations('billing')
  const handleClick = async () => {
    await fetch('/api/billing/free', { method: 'POST' })
    window.location.reload()
  }
  return (
    <Button variant="secondary" onClick={handleClick}>
      {t('cancelPlan')}
    </Button>
  )
}

export default async function BillingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const user = await getCurrentUser()
  if (!user) return null
  const t = useTranslations('billing')
  const tStatus = useTranslations('billing.status')
  const tPricing = useTranslations('pricing')

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const periodEnd =
    subscription && ((subscription as any).currentPeriodEnd || (subscription as any).endDate)

  const planDetails = await getPlan(String((user as any).plan))
  const priceFormatter =
    planDetails &&
    new Intl.NumberFormat(locale, { style: 'currency', currency: planDetails.currency })
  const price =
    planDetails &&
    (planDetails.priceCents === 0
      ? tPricing('plan.price.free')
      : tPricing('plan.price.perMonth', {
          price: priceFormatter!.format(planDetails.priceCents / 100),
        }))

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('currentPlan')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>
            {tPricing(`plan.${String((user as any).plan).toLowerCase()}`)}
            {price && ` - ${price}`}
          </p>
          {subscription && (
            <div className="space-y-1 text-sm">
              <p>
                {t('statusLabel')}: {tStatus(subscription.status as any)}
              </p>
              {periodEnd && (
                <p>
                  {t('currentPeriodEnd')}: {new Date(periodEnd).toISOString().slice(0, 10)}
                </p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild>
            <Link href="/pricing">{t('changePlan')}</Link>
          </Button>
          {subscription && <CancelButton />}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t('usage')}</CardTitle>
        </CardHeader>
        <CardContent>
          <UsageMeter />
        </CardContent>
      </Card>
    </div>
  )
}
