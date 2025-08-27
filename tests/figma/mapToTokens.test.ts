import { describe, it, expect } from 'vitest';
import { mapFigmaTokensToCss } from '@/lib/figma/mapToTokens';
import type { ParsedFigma } from '@/lib/figma/parse';

describe('mapFigmaTokensToCss', () => {
  it('converts token fields to CSS variables', () => {
    const parsed: ParsedFigma = {
      tokens: { brandColor: '#123456', text: '#111111', background: '#ffffff', radius: 8 },
      sections: [],
      pages: [],
      meta: { source: 'api' },
    };
    const css = mapFigmaTokensToCss(parsed);
    expect(css['--primary']).toBe('#123456');
    expect(css['--text']).toBe('#111111');
    expect(css['--bg']).toBe('#ffffff');
    expect(css['--radius-lg']).toBe('8px');
  });
});
