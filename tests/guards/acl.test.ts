import { describe, expect, it } from 'vitest';
import { resolvePermissions } from '@/server/guards/acl';

describe('resolvePermissions', () => {
  it('owner has all perms', () => {
    const set = resolvePermissions('OWNER');
    expect(set.has('project:share')).toBe(true);
    expect(set.has('project:billing')).toBe(true);
  });

  it('collaborator lacks share and billing', () => {
    const set = resolvePermissions('COLLABORATOR');
    expect(set.has('project:share')).toBe(false);
    expect(set.has('project:billing')).toBe(false);
    expect(set.has('project:write')).toBe(true);
  });

  it('viewer only read', () => {
    const set = resolvePermissions('VIEWER');
    expect(set.has('project:read')).toBe(true);
    expect(set.size).toBe(1);
  });
});

