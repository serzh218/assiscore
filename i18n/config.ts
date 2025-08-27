export const locales = ['ru', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'ru';
export const currencyByLocale: Record<Locale, string> = { ru: 'RUB', en: 'USD' };
