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

function CancelButton() {
  'use client'
  const handleClick = async () => {
    await fetch('/api/billing/free', { method: 'POST' })
    window.location.reload()
  }
  return (
    <Button variant="secondary" onClick={handleClick}>
      Cancel subscription
    </Button>
  )
}

export default async function BillingPage() {
  const user = await getCurrentUser()
  if (!user) return null

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
          <CardTitle>Current plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>{user.plan}</p>
          {subscription && (
            <div className="space-y-1 text-sm">
              <p>Status: {subscription.status}</p>
              {periodEnd && (
                <p>Current period end: {new Date(periodEnd).toISOString().slice(0, 10)}</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button asChild>
            <Link href="/pricing">Change plan</Link>
          </Button>
          {subscription && <CancelButton />}
        </CardFooter>
      </Card>

      {entitlements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Entitlements</CardTitle>
          </CardHeader>
          <CardContent>
            <Table headers={['Feature', 'Usage', 'Limit']}>
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
