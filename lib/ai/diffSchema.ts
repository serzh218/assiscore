import path from 'node:path';
import { applyPatch } from 'diff';
import { z } from 'zod';
import { isAllowed } from './schema';

export const DiffBundle = z.object({
  diffs: z.array(
    z.object({
      path: z.string(),
      diff: z.string(),
    }),
  ),
  notes: z.string().optional(),
});

export type TDiffBundle = z.infer<typeof DiffBundle>;

const MAX_PATCH_SIZE = 200 * 1024; // 200KB
const MAX_FILES = 20;

export function sanitizeAndValidateDiffs(
  bundle: TDiffBundle,
  files: Record<string, string>,
): { updated: Record<string, string> } {
  DiffBundle.parse(bundle);
  if (bundle.diffs.length > MAX_FILES) {
    throw new Error('TOO_MANY_FILES');
  }
  const updated: Record<string, string> = {};
  let total = 0;
  for (const item of bundle.diffs) {
    let p = item.path.replace(/\\/g, '/');
    p = p.replace(/^\/+/, '');
    p = path.posix.normalize(p);
    if (p.includes('..') || p.startsWith('/') || p.split('/').some((seg) => seg.startsWith('.'))) {
      throw new Error('INVALID_PATH');
    }
    if (!isAllowed(p)) {
      throw new Error('PATH_NOT_ALLOWED');
    }
    total += Buffer.byteLength(item.diff);
    if (total > MAX_PATCH_SIZE) {
      throw new Error('PATCH_TOO_LARGE');
    }
    const base = Object.prototype.hasOwnProperty.call(updated, p)
      ? updated[p]
      : files[p];
    if (base === undefined) {
      throw new Error('FILE_NOT_FOUND');
    }
    if (!/^---\s.+\n\+\+\+\s.+\n/.test(item.diff) || !item.diff.includes('@@')) {
      throw new Error('INVALID_DIFF');
    }
    const result = applyPatch(base, item.diff);
    if (result === false) {
      throw new Error('INVALID_DIFF');
    }
    updated[p] = result;
  }
  return { updated };
}
