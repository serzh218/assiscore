import { describe, it, expect } from 'vitest';
import { diffFiles } from '@/lib/diff/files';

describe('diffFiles', () => {
  it('detects added, removed and changed files', () => {
    const a = { 'a.txt': '1', 'b.txt': '2' };
    const b = { 'b.txt': '2 modified', 'c.txt': '3' };
    const res = diffFiles(a, b);
    expect(res).toContainEqual({ path: 'c.txt', type: 'added' });
    expect(res).toContainEqual({ path: 'a.txt', type: 'removed' });
    const changed = res.find((r) => r.path === 'b.txt');
    expect(changed?.type).toBe('changed');
    expect(changed?.diff).toBeTruthy();
  });
});
