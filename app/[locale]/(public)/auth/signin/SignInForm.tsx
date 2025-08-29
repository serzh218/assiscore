'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signIn } from 'next-auth/react'
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

export default function SignInForm({ locale }: Props) {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || `/${locale}/studio`
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [credError, setCredError] = useState(false)

  useEffect(() => {
    const err = searchParams.get('error')
    if (!err) return
    if (err === 'OAuthAccountNotLinked') toast.error(t('error.oauth'))
    else if (err === 'CredentialsSignin') toast.error(t('error.credentials'))
    else toast.error(t('error.unknown'))
  }, [searchParams, t])

  const handleGithub = async () => {
    setLoading(true)
    await signIn('github', { callbackUrl: next })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCredError(false)
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setCredError(true)
      if (res.error === 'CredentialsSignin') toast.error(t('error.credentials'))
      else toast.error(t('error.unknown'))
      setLoading(false)
    } else {
      router.push(next)
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <Card>
        <CardHeader>
          <CardTitle>{t('signin.title')}</CardTitle>
          <CardDescription>{t('redirect.backToApp')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGithub} className="w-full" disabled={loading}>
            {t('signin.github')}
          </Button>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('signin.email')}
              required
              className={credError ? 'border-destructive' : ''}
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('signin.password')}
              required
              className={credError ? 'border-destructive' : ''}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {t('signin.submit')}
            </Button>
          </form>
          <p className="text-center text-sm text-muted">
            {t('links.noAccount')}{' '}
            <Link href={`/${locale}/auth/signup`} className="text-primary hover:underline">
              {t('nav.signup')}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
