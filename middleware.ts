import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'
import createIntlMiddleware from 'next-intl/middleware'

import { locales, defaultLocale } from './i18n/config'

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

export default withAuth((req: NextRequest) => intlMiddleware(req), {
  pages: { signIn: '/auth/sign-in' },
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname.split('/')[2]
      const protectedRoutes = ['studio', 'projects', 'billing', 'settings']
      if (protectedRoutes.includes(path)) {
        return !!token
      }
      return true
    },
  },
})

export const config = {
  matcher: ['/((?!api|_next|.*\..*).*)'],
}
