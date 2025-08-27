import { describe, it, expect } from 'vitest';
import { applyUnifiedDiff } from '@/lib/diff';

describe('applyUnifiedDiff', () => {
  it('modifies existing file', () => {
    const files = { 'app/test.txt': 'hello\nworld' };
    const diff = `--- a/app/test.txt\n+++ b/app/test.txt\n@@ -1,2 +1,2 @@\n hello\n-world\n+WORLD\n`;
    const res = applyUnifiedDiff(files, diff);
    expect(res.files['app/test.txt']).toBe('hello\nWORLD\n');
  });

  it('adds new file', () => {
    const files: Record<string, string> = {};
    const diff = `--- /dev/null\n+++ b/app/new.txt\n@@ -0,0 +1,1 @@\n+hello\n`;
    const res = applyUnifiedDiff(files, diff);
    expect(res.files['app/new.txt']).toBe('hello\n');
  });

  it('deletes file', () => {
    const files = { 'app/old.txt': 'hey\nthere' };
    const diff = `--- a/app/old.txt\n+++ /dev/null\n@@ -1,2 +0,0 @@\n-hey\n-there\n`;
    const res = applyUnifiedDiff(files, diff);
    expect(res.files['app/old.txt']).toBeUndefined();
  });

  it('throws on invalid diff', () => {
    expect(() => applyUnifiedDiff({}, 'invalid')).toThrowError('INVALID_DIFF');
  });
});
