import {currencyByLocale, Locale} from '@/i18n/config';

export function formatCurrency(amount: number, locale: Locale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyByLocale[locale]
  }).format(amount / 100);
}

export function formatTokens(n: number, locale: Locale) {
  const r = new Intl.PluralRules(locale);
  const plural = r.select(n);
  const forms: Record<Locale, Record<string, string>> = {
    ru: {
      one: '{n} токен',
      few: '{n} токена',
      many: '{n} токенов',
      other: '{n} токенов'
    },
    en: {
      one: '{n} token',
      other: '{n} tokens'
    }
  };
  const template = forms[locale][plural] || forms[locale].other;
  return template.replace('{n}', String(n));
}

export function formatDate(
  ts: Date | number,
  locale: Locale,
  mode: 'short' | 'medium' | 'long' = 'medium'
) {
  return new Intl.DateTimeFormat(locale, { dateStyle: mode }).format(ts);
}

export function formatRelative(
  date: Date | number,
  now: Date | number,
  locale: Locale
) {
  const diff = Number(date) - Number(now);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const sec = Math.round(diff / 1000);
  if (Math.abs(sec) < 60) return rtf.format(sec, 'second');
  const min = Math.round(sec / 60);
  if (Math.abs(min) < 60) return rtf.format(min, 'minute');
  const hours = Math.round(min / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  return rtf.format(days, 'day');
}
