import { describe, it, expect } from 'vitest';
import { resolveUrl } from '@/lib/figma/api';

describe('resolveUrl', () => {
  it('parses file key and node id', () => {
    const res = resolveUrl('https://www.figma.com/file/ABC123/name?node-id=1-2');
    expect(res).toEqual({ fileKey: 'ABC123', nodeId: '1-2' });
  });
  it('supports /design links', () => {
    const res = resolveUrl('https://www.figma.com/design/XYZ987/foo');
    expect(res).toEqual({ fileKey: 'XYZ987', nodeId: undefined });
  });
  it('returns null for invalid url', () => {
    expect(resolveUrl('https://example.com')).toBeNull();
  });
});
