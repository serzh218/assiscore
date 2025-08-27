import fs from 'fs';
import path from 'path';
import { ASSISTANT_CONTEXT_TOKENS } from '@/lib/limits';
import { searchSimilar } from '@/server/code/indexer';

export interface MakeContextArgs {
  projectId: string;
  filePath?: string;
  selection?: { start: number; end: number; content: string };
  question?: string;
}

function approxTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function makeCodeContext(args: MakeContextArgs): Promise<{ content: string }> {
  const parts: string[] = [];
  const baseDir = process.cwd();
  if (args.filePath) {
    const full = path.join(baseDir, args.filePath);
    if (fs.existsSync(full)) {
      const file = fs.readFileSync(full, 'utf8');
      if (args.selection) {
        parts.push(`// selection\n${args.selection.content}`);
        const lines = file.split('\n');
        const startLine = Math.max(0, args.selection.start - 5);
        const endLine = Math.min(lines.length, args.selection.end + 5);
        parts.push(`// neighbors\n${lines.slice(startLine, endLine).join('\n')}`);
      } else {
        parts.push(file);
      }
    }
  }
  const query = args.selection?.content || args.question || '';
  if (query) {
    const sims = await searchSimilar(args.projectId, query, 3);
    sims.forEach((c) => parts.push(`// similar:${c.path}\n${c.content}`));
  }
  // project artifacts
  ['tokens.css', 'package.json'].forEach((p) => {
    const full = path.join(baseDir, p);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8');
      parts.push(`// artifact:${p}\n${content}`);
    }
  });
  let content = parts.join('\n\n');
  const max = ASSISTANT_CONTEXT_TOKENS;
  const tokens = approxTokens(content);
  if (tokens > max) {
    const allowedChars = max * 4;
    content = content.slice(0, allowedChars);
  }
  return { content };
}
