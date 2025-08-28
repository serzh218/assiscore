import type { Metadata } from 'next'
import '../globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales, defaultLocale } from '@/i18n/config'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'AssisCore',
  description:
    'AssisCore — преобразуйте любой сайт за секунды с помощью конструктора сайтов на AI.',
}

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-sans', display: 'swap' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' })

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale as any)) {
    redirect(`/${defaultLocale}`)
  }
  const messages = await getMessages()
  const skipLabel = (messages as any).ui?.a11y?.skipToContent ?? 'Skip'
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${mono.variable} min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-primary text-primary-foreground px-3 py-2 rounded-md"
            >
              {skipLabel}
            </a>
            <div id="main">{children}</div>
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
