import type { Metadata } from 'next'
import '../globals.css'
import '@/styles/theme.css'
import { Toaster } from '@/components/ui'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales, defaultLocale } from '@/i18n/config'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'AssisCore',
  description:
    'AssisCore — преобразуйте любой сайт за секунды с помощью конструктора сайтов на AI.',
}

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
  return (
    <html lang={locale} dir="ltr">
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex min-h-screen flex-col bg-bg text-text">
            <Navbar locale={locale} />
            <main className="flex-1">{children}</main>
            <Footer locale={locale} />
            <Toaster />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
