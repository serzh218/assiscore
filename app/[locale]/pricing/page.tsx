import { listPlans, type PlanWithFeatures } from '@/server/billing/plans'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, Button } from '@/components/ui'

function PlanFeatures({ features }: { features: PlanWithFeatures['features'] }) {
  return (
    <ul className="space-y-1 text-sm">
      <li>Generations per month: {features.genPerMonth}</li>
      <li>Private projects: {features.privateProjects}</li>
      <li>GitHub export: {features.githubExport ? 'Yes' : 'No'}</li>
      <li>Deploy: {features.deploy ? 'Yes' : 'No'}</li>
      <li>Monthly tokens: {features.monthlyTokens}</li>
      <li>Assistant calls per hour: {features.assistantCallsPerHour}</li>
      <li>Test-first cycles per month: {features.testFirstCyclesPerMonth}</li>
    </ul>
  )
}

function SelectButton({ plan }: { plan: PlanWithFeatures }) {
  'use client'
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
  return <Button onClick={handleClick}>Select</Button>
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const plans = await listPlans()
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const priceFormatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: plan.currency,
        })
        const price = plan.priceCents === 0 ? 'Free' : priceFormatter.format(plan.priceCents / 100)
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
