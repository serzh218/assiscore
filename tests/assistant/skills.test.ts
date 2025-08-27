import { describe, it, expect } from 'vitest';
import { applyUnifiedDiff } from '@/lib/diff';
import { explainCode, refactor, writeTests } from '@/server/ai/skills';

describe('assistant skills', () => {
  it('explains code', async () => {
    const res = await explainCode({ selection: { start: 0, end: 0, content: 'const a=1;' } });
    expect(res.text).toContain('Explanation');
  });

  it('refactors code with diff', async () => {
    const sel = { start: 0, end: 0, content: 'const a=1;' };
    const { diff } = await refactor({ filePath: 'app/code.ts', selection: sel });
    const applied = applyUnifiedDiff({ 'app/code.ts': sel.content }, diff);
    expect(applied.files['app/code.ts']).toContain('refactored');
  });

  it('writes tests', async () => {
    const { diff } = await writeTests({ filePath: 'app/code.ts' });
    const applied = applyUnifiedDiff({}, diff);
    expect(applied.files['app/code.test.ts']).toBeDefined();
  });
});
