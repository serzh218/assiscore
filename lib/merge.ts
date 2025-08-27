import diff3 from 'node-diff3';
import { isAllowed } from '@/lib/ai/schema';

export type MergeResult = {
  files: Record<string, string>;
  conflicts: Array<{ path: string; ours?: string; theirs?: string; base?: string; merged?: string }>;
  changed: string[];
};

function diff3MergeStr(base: string, ours: string, theirs: string) {
  const segments = diff3.diff3Merge(base.split('\n'), ours.split('\n'), theirs.split('\n'), {
    stringSeparator: '\n',
  });
  let conflict = false;
  const lines: string[] = [];
  for (const seg of segments) {
    if (seg.ok) {
      lines.push(...seg.ok);
    } else {
      conflict = true;
      lines.push('<<<<<<< Ours', ...seg.conflict.a, '=======', ...seg.conflict.b, '>>>>>>> Theirs');
    }
  }
  return { conflict, result: lines.join('\n') };
}

function mergeContent(base: string, ours: string, theirs: string) {
  const bLines = base.split('\n');
  const oLines = ours.split('\n');
  const tLines = theirs.split('\n');
  if (oLines.length === bLines.length && tLines.length === bLines.length) {
    let conflict = false;
    const merged: string[] = [];
    for (let i = 0; i < bLines.length; i++) {
      const bl = bLines[i];
      const ol = oLines[i];
      const tl = tLines[i];
      if (ol === tl) merged.push(ol);
      else if (ol === bl) merged.push(tl);
      else if (tl === bl) merged.push(ol);
      else {
        conflict = true;
        break;
      }
    }
    if (!conflict) {
      return { conflict: false, result: merged.join('\n') };
    }
  }
  return diff3MergeStr(base, ours, theirs);
}

const MAX_FILE_SIZE = 300 * 1024;
const MAX_TOTAL_SIZE = 2 * 1024 * 1024;

export function threeWayMerge({
  base,
  ours,
  theirs,
  allowNewFiles = true,
  allowDeletes = true,
}: {
  base: Record<string, string>;
  ours: Record<string, string>;
  theirs: Record<string, string>;
  allowNewFiles?: boolean;
  allowDeletes?: boolean;
}): MergeResult {
  const files: Record<string, string> = {};
  const conflicts: Array<{ path: string; ours?: string; theirs?: string; base?: string; merged?: string }> = [];
  const changed: string[] = [];
  const paths = new Set([
    ...Object.keys(base),
    ...Object.keys(ours),
    ...Object.keys(theirs),
  ]);
  let total = 0;
  for (const path of paths) {
    if (!isAllowed(path)) continue;
    const b = base[path];
    const o = ours[path];
    const t = theirs[path];
    const sizes = [b, o, t].map((s) => (s ? Buffer.byteLength(s) : 0));
    const maxSize = Math.max(...sizes);
    total += maxSize;
    if (maxSize > MAX_FILE_SIZE || total > MAX_TOTAL_SIZE) {
      conflicts.push({ path, base: b, ours: o, theirs: t, merged: 'too-large' });
      continue;
    }

    const hasB = b !== undefined;
    const hasO = o !== undefined;
    const hasT = t !== undefined;

    if (!hasB && !hasO && hasT) {
      if (allowNewFiles) {
        files[path] = t!;
        changed.push(path);
      } else {
        conflicts.push({ path, theirs: t });
      }
      continue;
    }
    if (!hasB && hasO && !hasT) {
      if (allowNewFiles) {
        files[path] = o!;
        changed.push(path);
      } else {
        conflicts.push({ path, ours: o });
      }
      continue;
    }
    if (!hasB && hasO && hasT) {
      if (o === t) {
        files[path] = o!;
        changed.push(path);
      } else {
        const m = mergeContent('', o!, t!);
        if (m.conflict) conflicts.push({ path, ours: o, theirs: t, base: b, merged: m.result });
        else {
          files[path] = m.result;
          changed.push(path);
        }
      }
      continue;
    }
    if (hasB && !hasO && !hasT) {
      if (allowDeletes) {
        changed.push(path);
      } else {
        conflicts.push({ path, base: b });
      }
      continue;
    }
    if (hasB && hasO && !hasT) {
      if (allowDeletes) {
        conflicts.push({ path, base: b, ours: o, theirs: t });
      } else {
        files[path] = o!;
        changed.push(path);
      }
      continue;
    }
    if (hasB && !hasO && hasT) {
      if (t === b) {
        if (allowDeletes) {
          changed.push(path);
        } else {
          conflicts.push({ path, base: b, theirs: t });
        }
      } else {
        conflicts.push({ path, base: b, theirs: t, ours: o });
      }
      continue;
    }
    // hasB && hasO && hasT
    if (o === b && t === b) continue; // unchanged
    if (o === b && t !== b) {
      files[path] = t!;
      changed.push(path);
      continue;
    }
    if (t === b && o !== b) {
      files[path] = o!;
      changed.push(path);
      continue;
    }
    if (o === t) {
      files[path] = o!;
      changed.push(path);
      continue;
    }
        const m = mergeContent(b!, o!, t!);
    if (m.conflict) {
      conflicts.push({ path, ours: o, theirs: t, base: b, merged: m.result });
    } else {
      files[path] = m.result;
      changed.push(path);
    }
  }
  return { files, conflicts, changed };
}

