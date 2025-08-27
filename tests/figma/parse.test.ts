import { describe, it, expect } from 'vitest';
import { parseJsonUpload } from '@/lib/figma/parse';
import fs from 'fs';
import path from 'path';

const fixture = JSON.parse(fs.readFileSync(path.join(__dirname, '__fixtures__', 'figma-file.json'), 'utf8'));

describe('figma parse', () => {
  it('extracts tokens and sections', () => {
    const parsed = parseJsonUpload(fixture);
    expect(parsed.tokens.brandColor).toBe('#ff0000');
    expect(parsed.tokens.fontPrimary?.family).toBe('Roboto');
    expect(parsed.sections.length).toBeGreaterThan(0);
  });
});
