import { describe, it, expect } from 'vitest';
import { resolvePermissions, canTransferOwnership } from '@/server/guards/acl';

describe('maintainer role', () => {
  it('has expected permissions', () => {
    const perms = resolvePermissions('MAINTAINER');
    expect(perms.has('project:read')).toBe(true);
    expect(perms.has('project:write')).toBe(true);
    expect(perms.has('project:share')).toBe(true);
    expect(perms.has('project:deploy')).toBe(true);
    expect(perms.has('project:export')).toBe(true);
    expect(perms.has('project:settings')).toBe(true);
    expect(perms.has('project:billing')).toBe(false);
    expect(perms.has('project:transfer')).toBe(false);
  });

  it('canTransferOwnership only owner', () => {
    expect(canTransferOwnership('OWNER')).toBe(true);
    expect(canTransferOwnership('MAINTAINER')).toBe(false);
    expect(canTransferOwnership('COLLABORATOR')).toBe(false);
  });
});
