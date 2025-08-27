import path from 'path';

const ALLOWED_PREFIXES = ['app/', 'components/', 'styles/', 'public/', 'lib/', 'templates/'];

function isAllowed(p: string): boolean {
  if (!p) return false;
  if (p.includes('..') || path.isAbsolute(p)) return false;
  if (p.split('/').some((seg) => seg.startsWith('.'))) return false;
  return ALLOWED_PREFIXES.some((prefix) => p.startsWith(prefix));
}

export function applyUnifiedDiff(files: Record<string, string>, diff: string): { files: Record<string, string> } {
  const lines = diff.split('\n');
  let i = 0;
  const result: Record<string, string> = { ...files };

  while (i < lines.length) {
    // skip empty or meta lines
    while (i < lines.length && lines[i] && !lines[i].startsWith('--- ')) {
      const skipPrefixes = ['diff --git', 'index', 'new file mode', 'deleted file mode'];
      if (lines[i].trim() === '' || skipPrefixes.some((p) => lines[i].startsWith(p))) {
        i++;
      } else {
        throw new Error('INVALID_DIFF');
      }
    }
    if (i >= lines.length) break;

    const oldLine = lines[i++];
    const newLine = lines[i++];
    if (!oldLine.startsWith('--- ') || !newLine.startsWith('+++ ')) {
      throw new Error('INVALID_DIFF');
    }
    const oldPathRaw = oldLine.slice(4).trim();
    const newPathRaw = newLine.slice(4).trim();
    const rawPath = newPathRaw === '/dev/null' ? oldPathRaw : newPathRaw;
    const filePath = rawPath.replace(/^a\//, '').replace(/^b\//, '');
    if (!isAllowed(filePath)) throw new Error('INVALID_DIFF');

    const orig = Object.prototype.hasOwnProperty.call(result, filePath) ? result[filePath].split('\n') : [];
    let cursor = 0;
    const newFileLines: string[] = [];

    while (i < lines.length && lines[i].startsWith('@@')) {
      const header = lines[i++];
      const m = /@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(header);
      if (!m) throw new Error('INVALID_DIFF');
      const oldStart = parseInt(m[1], 10);
      const startIndex = Math.max(oldStart - 1, 0);
      newFileLines.push(...orig.slice(cursor, startIndex));
      cursor = startIndex;

      while (i < lines.length && !lines[i].startsWith('@@') && !lines[i].startsWith('--- ')) {
        const line = lines[i];
        if (line.startsWith('+')) {
          newFileLines.push(line.slice(1));
        } else if (line.startsWith('-')) {
          if (orig[cursor] !== line.slice(1)) throw new Error('INVALID_DIFF');
          cursor++;
        } else if (line.startsWith(' ')) {
          if (orig[cursor] !== line.slice(1)) throw new Error('INVALID_DIFF');
          newFileLines.push(orig[cursor]);
          cursor++;
        } else if (line.startsWith('\\')) {
          // ignore 'No newline at end of file'
        } else if (line === '') {
          // empty line as context
          newFileLines.push('');
        } else {
          break;
        }
        i++;
      }
    }
    newFileLines.push(...orig.slice(cursor));
    const newContent = newFileLines.join('\n');
    if (newContent === '') {
      delete result[filePath];
    } else {
      result[filePath] = newContent;
    }
  }

  return { files: result };
}

export function invertUnifiedDiff(_diff: string): string {
  // TODO: implement inversion for rollback
  throw new Error('NOT_IMPLEMENTED');
}
