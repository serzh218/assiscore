'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
} from '@/components/ui'
import { toast } from 'sonner'

interface Props {
  locale: string
}

export default function SignUpForm({ locale }: Props) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      setError(true)
      toast.error(t('error.credentials'))
      return
    }
    setLoading(true)
    setError(false)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (res.ok) {
      router.push(`/${locale}/auth/signin`)
    } else if (res.status === 409) {
      toast.error(t('error.credentials'))
      setLoading(false)
    } else {
      toast.error(t('error.unknown'))
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>{t('signup.title')}</CardTitle>
          <CardDescription>{t('redirect.backToApp')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('signin.email')}
              required
              className={error ? 'border-destructive' : ''}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('signin.password')}
              required
              className={error ? 'border-destructive' : ''}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {t('signup.submit')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted">
            {t('links.haveAccount')}{' '}
            <Link href={`/${locale}/auth/signin`} className="text-primary hover:underline">
              {t('nav.signin')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
