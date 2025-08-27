import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(async () => ({ id: 'u1' })),
}));

vi.mock('@/server/repo/project', () => ({
  getProjectById: vi.fn(async () => ({ id: 'p1', ownerId: 'u1', spec: {}, files: {} })),
  getProjectFiles: vi.fn(async () => ({})),
  setProjectFiles: vi.fn(async () => {}),
  updateProjectSpec: vi.fn(async () => ({})),
}));

vi.mock('@/server/queue/generationQueue', () => ({
  enqueueRebuild: vi.fn(async () => {}),
}));

describe('figma import API', () => {
  it('parses json upload', async () => {
    const { POST } = await import('@/app/api/figma/parse/route');
    const json = fs.readFileSync(path.join(__dirname, '../figma/__fixtures__/figma-file.json'), 'utf8');
    const res = await POST(
      new Request('http://test/api/figma/parse', {
        method: 'POST',
        body: JSON.stringify({ jsonUploadBase64: Buffer.from(json).toString('base64') }),
      }),
    );
    const data = await res.json();
    expect(data.tokens.brandColor).toBe('#ff0000');
  });

  it('imports into project', async () => {
    const { POST } = await import('@/app/api/projects/[id]/figma/import/route');
    const json = fs.readFileSync(path.join(__dirname, '../figma/__fixtures__/figma-file.json'), 'utf8');
    const res = await POST(
      new Request('http://test/api/projects/p1/figma/import', {
        method: 'POST',
        body: JSON.stringify({ jsonUploadBase64: Buffer.from(json).toString('base64'), applyToProject: true }),
      }),
      { params: { id: 'p1' } } as any,
    );
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.hasApplied).toBe(true);
  });
});
