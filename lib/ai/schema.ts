import path from 'node:path';
import { z } from 'zod';

export const FileItem = z.object({
  path: z.string().min(1),
  content: z.string().default(''),
  binaryBase64: z.string().optional(),
});

export const FileBundle = z.object({
  files: z.array(FileItem),
  notes: z.string().optional(),
});

export type TFileBundle = z.infer<typeof FileBundle>;

export const ALLOWED_PATHS = [
  'app/**',
  'components/**',
  'styles/**',
  'public/**',
  'lib/**',
  'templates/**',
  'index.html',
  'assets/**',
];

const MAX_FILES = 200;
const MAX_TEXT_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BINARY_SIZE = 2 * 1024 * 1024; // 2MB

function isAllowed(p: string): boolean {
  return ALLOWED_PATHS.some((pat) => {
    if (pat.endsWith('/**')) {
      return p.startsWith(pat.slice(0, -3));
    }
    return p === pat;
  });
}

export function sanitizeAndValidateBundle(bundle: TFileBundle): {
  files: Record<string, string>;
  binaries: Record<string, Uint8Array>;
} {
  FileBundle.parse(bundle);
  const files: Record<string, string> = {};
  const binaries: Record<string, Uint8Array> = {};
  let textSize = 0;

  for (const item of bundle.files) {
    let p = item.path.replace(/\\/g, '/');
    p = p.replace(/^\/+/, '');
    p = path.posix.normalize(p);
    if (p.includes('..') || p.startsWith('/') || p.split('/').some((seg) => seg.startsWith('.'))) {
      throw new Error('INVALID_PATH');
    }
    if (!isAllowed(p)) {
      throw new Error('PATH_NOT_ALLOWED');
    }
    if (files[p] || binaries[p]) {
      continue; // skip duplicates
    }

    if (item.binaryBase64) {
      const bytes = Buffer.from(item.binaryBase64, 'base64');
      if (bytes.length > MAX_BINARY_SIZE) {
        throw new Error('BINARY_TOO_LARGE');
      }
      binaries[p] = new Uint8Array(bytes);
    } else {
      textSize += Buffer.byteLength(item.content);
      if (textSize > MAX_TEXT_SIZE) {
        throw new Error('TEXT_TOO_LARGE');
      }
      if (p.endsWith('.html') && /<script[^>]*src=["']https?:/i.test(item.content)) {
        throw new Error('EXTERNAL_SCRIPT');
      }
      files[p] = item.content;
    }
  }

  if (Object.keys(files).length + Object.keys(binaries).length > MAX_FILES) {
    throw new Error('TOO_MANY_FILES');
  }

  return { files, binaries };
}
