import { describe, it, expect } from 'vitest';
import { sanitizeAndValidateDiffs } from '@/lib/ai/diffSchema';

describe('sanitizeAndValidateDiffs', () => {
  it('applies valid diff', () => {
    const files = { 'index.html': '<h1>Hi</h1>\n' };
    const bundle = {
      diffs: [
        {
          path: 'index.html',
          diff: '--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-<h1>Hi</h1>\n+<h1>Hello</h1>\n',
        },
      ],
    };
    const res = sanitizeAndValidateDiffs(bundle as any, files);
    expect(res.updated['index.html']).toContain('Hello');
  });

  it('throws on missing file', () => {
    const files = {};
    const bundle = {
      diffs: [
        { path: 'index.html', diff: '--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-<h1>Hi</h1>\n+<h1>Hello</h1>\n' },
      ],
    };
    expect(() => sanitizeAndValidateDiffs(bundle as any, files)).toThrow();
  });

  it('throws on invalid diff', () => {
    const files = { 'index.html': '<h1>Hi</h1>\n' };
    const bundle = {
      diffs: [{ path: 'index.html', diff: 'invalid diff' }],
    };
    expect(() => sanitizeAndValidateDiffs(bundle as any, files)).toThrow('INVALID_DIFF');
  });
});
