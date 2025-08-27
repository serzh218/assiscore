import { describe, it, expect } from 'vitest';
import { formatCurrency, formatTokens, formatDate, formatRelative } from '@/lib/i18n/format';

describe('i18n formatters', () => {
  it('formats currency', () => {
    expect(formatCurrency(49900, 'ru')).toBe('499,00 ₽');
    expect(formatCurrency(49900, 'en')).toBe('$499.00');
  });

  it('pluralizes tokens', () => {
    expect(formatTokens(1, 'ru')).toBe('1 токен');
    expect(formatTokens(2, 'ru')).toBe('2 токена');
    expect(formatTokens(5, 'ru')).toBe('5 токенов');
    expect(formatTokens(21, 'ru')).toBe('21 токен');
    expect(formatTokens(22, 'ru')).toBe('22 токена');
    expect(formatTokens(1, 'en')).toBe('1 token');
    expect(formatTokens(2, 'en')).toBe('2 tokens');
  });

  it('formats date and relative', () => {
    const d = new Date('2024-01-01T00:00:00Z');
    expect(formatDate(d, 'ru', 'short')).toBeDefined();
    expect(formatRelative(d, d, 'en')).toBe('now');
  });
});
