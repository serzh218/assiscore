import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import createIntlMiddleware from 'next-intl/middleware'

import { locales, defaultLocale } from './i18n/config'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone()
  const segments = url.pathname.split('/')
  let locale = defaultLocale
  let rest = segments.slice(1)
  if (locales.includes(segments[1] as any)) {
    locale = segments[1]
    rest = segments.slice(2)
  }
  const path = rest.join('/')
  const isProtected = ['studio', 'projects', 'account'].some(
    (p) => path === p || path.startsWith(`${p}/`),
  )
  if (isProtected) {
    const token = await getToken({ req })
    if (!token) {
      const next = encodeURIComponent(url.pathname + url.search)
      return NextResponse.redirect(new URL(`/${locale}/auth/signin?next=${next}`, req.url))
    }
  }
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
