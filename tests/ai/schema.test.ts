import { describe, it, expect } from 'vitest';
import { sanitizeAndValidateBundle } from '@/lib/ai/schema';

describe('sanitizeAndValidateBundle', () => {
  it('accepts valid bundle', () => {
    const bundle = { files: [{ path: 'index.html', content: '<html></html>' }] };
    const res = sanitizeAndValidateBundle(bundle as any);
    expect(res.files['index.html']).toContain('<html>');
  });

  it('throws on forbidden path', () => {
    const bundle = { files: [{ path: '../../etc/passwd', content: 'x' }] };
    expect(() => sanitizeAndValidateBundle(bundle as any)).toThrow();
  });

  it('decodes binary file', () => {
    const base = Buffer.from('hello').toString('base64');
    const bundle = { files: [{ path: 'public/img.bin', content: '', binaryBase64: base }] };
    const res = sanitizeAndValidateBundle(bundle as any);
    const txt = new TextDecoder().decode(res.binaries['public/img.bin']);
    expect(txt).toBe('hello');
  });
});
