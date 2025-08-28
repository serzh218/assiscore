import Link from 'next/link'
import { Github, Book, Mail } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface FooterProps {
  locale: string
}

export default async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: 'common' })
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-border bg-bg-elev text-sm text-muted">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-6">
        <span>© AssisCore {year}</span>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/assiscore"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-primary"
          >
            <Github className="h-4 w-4" />
          </Link>
          <Link
            href="https://docs.assiscore.ai"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-primary flex items-center gap-1"
          >
            <Book className="h-4 w-4" /> {t('footer.docs')}
          </Link>
          <Link
            href="mailto:contact@assiscore.ai"
            className="transition-colors hover:text-primary flex items-center gap-1"
          >
            <Mail className="h-4 w-4" /> {t('footer.contact')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
