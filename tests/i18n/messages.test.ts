import check from '../../scripts/i18n-check';
import { describe, it, expect } from 'vitest';

describe('i18n messages', () => {
  it('locales have matching keys', () => {
    expect(() => check()).not.toThrow();
  });
});
