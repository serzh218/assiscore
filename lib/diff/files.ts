import { createTwoFilesPatch } from 'diff';

export type FileDiff = {
  path: string;
  type: 'added' | 'removed' | 'changed';
  diff?: string;
};

export function diffFiles(
  a: Record<string, string>,
  b: Record<string, string>,
): FileDiff[] {
  const result: FileDiff[] = [];
  const paths = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const p of paths) {
    const inA = Object.prototype.hasOwnProperty.call(a, p);
    const inB = Object.prototype.hasOwnProperty.call(b, p);
    if (inA && !inB) {
      result.push({ path: p, type: 'removed' });
    } else if (!inA && inB) {
      result.push({ path: p, type: 'added' });
    } else if (inA && inB && a[p] !== b[p]) {
      const patch = createTwoFilesPatch(p, p, a[p], b[p]);
      result.push({ path: p, type: 'changed', diff: patch });
    }
  }
  return result;
}
