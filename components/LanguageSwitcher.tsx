'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations('common.language');
  const router = useRouter();
  const pathname = usePathname();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = e.target.value;
    const segments = pathname.split('/');
    segments[1] = nextLocale;
    router.push(segments.join('/'));
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', nextLocale);
    }
  }

  return (
    <select
      aria-label={t('switch')}
      value={locale}
      onChange={onChange}
      className="text-sm bg-transparent border-none outline-none"
    >
      <option value="ru">{t('ru')}</option>
      <option value="en">{t('en')}</option>
    </select>
  );
}
