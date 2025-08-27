import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CodeChunk {
  projectId: string;
  path: string;
  chunkId: string;
  content: string;
  lang: string;
  hash: string;
  lastModified: number;
}

export interface IndexedChunk extends CodeChunk {
  vector: Record<string, number>;
}

const textExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.txt',
]);

function isTextFile(p: string): boolean {
  return textExtensions.has(path.extname(p));
}

function collectFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...collectFiles(full));
    else files.push(full);
  }
  return files;
}

function chunkContent(content: string): string[] {
  const tokens = content.split(/\s+/);
  const max = 800;
  const min = 200;
  const chunks: string[] = [];
  for (let i = 0; i < tokens.length; i += max) {
    const slice = tokens.slice(i, i + max);
    if (slice.length < min && chunks.length) {
      chunks[chunks.length - 1] += ' ' + slice.join(' ');
    } else {
      chunks.push(slice.join(' '));
    }
  }
  return chunks;
}

export async function buildCodeIndex(projectId: string, root = process.cwd()): Promise<CodeChunk[]> {
  const base = path.resolve(root);
  const files = collectFiles(base);
  const chunks: CodeChunk[] = [];
  for (const file of files) {
    if (!isTextFile(file)) continue;
    const rel = path.relative(base, file);
    const stat = fs.statSync(file);
    const content = fs.readFileSync(file, 'utf8');
    const hash = crypto.createHash('sha1').update(content).digest('hex');
    const pieces = chunkContent(content);
    pieces.forEach((chunk, idx) => {
      chunks.push({
        projectId,
        path: rel,
        chunkId: `${rel}:${idx}`,
        content: chunk,
        lang: path.extname(rel).slice(1),
        hash,
        lastModified: stat.mtimeMs,
      });
    });
  }
  return chunks;
}

function textToVector(text: string): Record<string, number> {
  const vec: Record<string, number> = {};
  const words = text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  for (const w of words) vec[w] = (vec[w] || 0) + 1;
  return vec;
}

export async function embedChunks(chunks: CodeChunk[]): Promise<IndexedChunk[]> {
  return chunks.map((c) => ({ ...c, vector: textToVector(c.content) }));
}

const memoryIndex = new Map<string, IndexedChunk[]>();

export async function saveIndex(projectId: string, vectors: IndexedChunk[]): Promise<void> {
  memoryIndex.set(projectId, vectors);
}

function cosine(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const key in a) {
    dot += (a[key] || 0) * (b[key] || 0);
    normA += a[key] * a[key];
  }
  for (const key in b) normB += b[key] * b[key];
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

export async function searchSimilar(projectId: string, query: string, k = 12): Promise<IndexedChunk[]> {
  const vectors = memoryIndex.get(projectId) || [];
  const qv = textToVector(query);
  const scored = vectors.map((c) => ({ chunk: c, score: cosine(c.vector, qv) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.chunk);
}
