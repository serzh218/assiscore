import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { buildCodeIndex, embedChunks, saveIndex } from '@/server/code/indexer';
import { makeCodeContext } from '@/server/ai/context';

describe('makeCodeContext', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'proj-'));
  const projId = 'proj1';
  beforeAll(async () => {
    fs.writeFileSync(path.join(tmp, 'app.ts'), 'export function add(a:number,b:number){return a+b;}');
    const chunks = await buildCodeIndex(projId, tmp);
    const vecs = await embedChunks(chunks);
    await saveIndex(projId, vecs);
  });

  it('gathers selection and similar chunks', async () => {
    const ctx = await makeCodeContext({
      projectId: projId,
      filePath: path.join(tmp, 'app.ts'),
      selection: { start: 0, end: 1, content: 'add(a:number,b:number)' },
      question: 'sum',
    });
    expect(ctx.content).toContain('add(a:number,b:number)');
    expect(ctx.content.length).toBeGreaterThan(0);
  });
});
