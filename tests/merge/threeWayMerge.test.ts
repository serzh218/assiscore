import { describe, it, expect } from 'vitest';
import { threeWayMerge } from '@/lib/merge';

describe('threeWayMerge', () => {
  it('applies upstream changes when fork untouched', () => {
    const base = { 'index.html': 'hello' };
    const ours = { 'index.html': 'hello' };
    const theirs = { 'index.html': 'hello world' };
    const res = threeWayMerge({ base, ours, theirs });
    expect(res.conflicts).toHaveLength(0);
    expect(res.files['index.html']).toBe('hello world');
    expect(res.changed).toEqual(['index.html']);
  });

  it('merges different lines without conflict', () => {
    const base = { 'app/a.txt': 'one\ntwo' };
    const ours = { 'app/a.txt': 'ONE\ntwo' };
    const theirs = { 'app/a.txt': 'one\nTWO' };
    const res = threeWayMerge({ base, ours, theirs });
    expect(res.conflicts).toHaveLength(0);
    expect(res.files['app/a.txt']).toBe('ONE\nTWO');
  });

  it('reports conflict on same line change', () => {
    const base = { 'app/a.txt': 'line' };
    const ours = { 'app/a.txt': 'mine' };
    const theirs = { 'app/a.txt': 'theirs' };
    const res = threeWayMerge({ base, ours, theirs });
    expect(res.conflicts).toHaveLength(1);
    const c = res.conflicts[0];
    expect(c.merged).toContain('<<<<<<< Ours');
    expect(c.merged).toContain('>>>>>>> Theirs');
  });

  it('adds new file from upstream', () => {
    const base = {};
    const ours = {};
    const theirs = { 'app/new.txt': 'content' };
    const res = threeWayMerge({ base, ours, theirs });
    expect(res.conflicts).toHaveLength(0);
    expect(res.files['app/new.txt']).toBe('content');
    expect(res.changed).toEqual(['app/new.txt']);
  });

  it('conflict on upstream delete and fork modify', () => {
    const base = { 'app/a.txt': 'old' };
    const ours = { 'app/a.txt': 'new' };
    const theirs = {}; // delete
    const res = threeWayMerge({ base, ours, theirs });
    expect(res.conflicts).toHaveLength(1);
  });
});
