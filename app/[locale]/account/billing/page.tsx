import Link from 'next/link'
import { getCurrentUser } from '@/auth'
import { prisma } from '@/lib/db'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Table,
} from '@/components/ui'
import { useTranslations } from 'next-intl'

function CancelButton() {
  'use client'
  const t = useTranslations('account.billing')
  const handleClick = async () => {
    await fetch('/api/billing/free', { method: 'POST' })
    window.location.reload()
  }
  return (
    <Button variant="secondary" onClick={handleClick}>
      {t('cancelSubscription')}
    </Button>
  )
}

export default async function BillingPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const t = useTranslations('account.billing')
  const tStatus = useTranslations('billing.status')

  const subscription = await prisma.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const entitlements = await prisma.entitlement.findMany({
    where: { userId: user.id },
    select: { id: true, feature: true, usage: true, limit: true },
  })

  const periodEnd =
    subscription && ((subscription as any).currentPeriodEnd || (subscription as any).endDate)

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('currentPlan')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{user.plan}</p>
          {subscription && (
            <div className="space-y-1 text-sm">
              <p>
                {t('status')}: {tStatus(subscription.status as any)}
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

      {entitlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('entitlements')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table headers={[t('feature'), t('usage'), t('limit')]}>
              {entitlements.map((e) => (
                <tr key={e.id}>
                  <td className="py-2">{e.feature}</td>
                  <td className="py-2">{e.usage}</td>
                  <td className="py-2">{e.limit}</td>
                </tr>
              ))}
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
