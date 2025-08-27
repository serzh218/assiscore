import React from 'react'
import { getCurrentUser } from '@/lib/auth'
import { listPayments } from '@/server/repo/payment'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Badge,
  Table,
} from '@/components/ui'
import { useTranslations } from 'next-intl'

const statusLabels: Record<string, string> = {
  pending: 'В ожидании',
  succeeded: 'Успешно',
  canceled: 'Отменено',
}

function BuyButton({
  type,
  tokens,
  children,
}: {
  type: 'PRO_SUBSCRIPTION' | 'TOKENS'
  tokens?: number
  children: React.ReactNode
}) {
  'use client'
  const handleClick = async () => {
    const res = await fetch('/api/billing/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, tokens }),
    })
    const data = await res.json()
    if (data.confirmationUrl) {
      window.location.href = data.confirmationUrl
    }
  }
  return <Button onClick={handleClick}>{children}</Button>
}

function SlaSection() {
  'use client'
  const t = useTranslations('obs')
  const [status, setStatus] = React.useState<'ok' | 'breached' | null>(null)
  React.useEffect(() => {
    fetch('/api/slo')
      .then((r) => r.json())
      .then((d) => setStatus(d.uptime.ok ? 'ok' : 'breached'))
  }, [])
  if (status === null) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('sla.title')}</CardTitle>
      </CardHeader>
      <CardContent>{t(`sla.status.${status}`)}</CardContent>
    </Card>
  )
}

export default async function BillingPage() {
  const user = await getCurrentUser()
  if (!user) return null
  const payments = await listPayments(user.id)
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Подписка PRO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Неограниченные приватные проекты, интеграция с GitHub, публикация на домены.</p>
          {user.plan === 'PRO' && <Badge variant="success">PRO активен</Badge>}
        </CardContent>
        {user.plan !== 'PRO' && (
          <CardFooter>
            <BuyButton type="PRO_SUBSCRIPTION">Перейти на PRO</BuyButton>
          </CardFooter>
        )}
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Токены</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span>100 токенов — 99 ₽</span>
            <BuyButton type="TOKENS" tokens={100}>
              Купить
            </BuyButton>
          </div>
          <div className="flex items-center justify-between">
            <span>1000 токенов — 899 ₽</span>
            <BuyButton type="TOKENS" tokens={1000}>
              Купить
            </BuyButton>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>История</CardTitle>
        </CardHeader>
        <CardContent>
          {user.plan === 'PRO' && <p className="mb-2 text-green-600">План PRO активен</p>}
          <Table headers={['Тип', 'Сумма', 'Статус', 'Дата']}>
            {payments.map((p) => (
              <tr key={p.id}>
                <td className="py-2">
                  {p.type === 'PRO_SUBSCRIPTION' ? 'Подписка PRO' : `Пакет токенов ${p.tokens}`}
                </td>
                <td className="py-2">{Math.round(p.amount / 100)} ₽</td>
                <td className="py-2">{statusLabels[p.status] || p.status}</td>
                <td className="py-2">{p.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </Table>
        </CardContent>
      </Card>
      <SlaSection />
    </div>
  )
}
