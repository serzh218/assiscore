import type { Metadata } from "next";
import "../globals.css";
import { Toaster } from "@/components/ui";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales, defaultLocale } from "@/i18n/config";
import { notFound, redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "AssisCore",
  description:
    "AssisCore — преобразуйте любой сайт за секунды с помощью конструктора сайтов на AI.",
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;
  if (!locales.includes(locale as any)) {
    redirect(`/${defaultLocale}`);
  }
  const messages = await getMessages();
  return (
    <html lang={locale} dir="ltr">
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
