import { describe, expect, it, vi } from 'vitest';
import { writeAudit } from '@/server/repo/audit';

var create: any;

vi.mock('@/lib/db', () => {
  create = vi.fn();
  return {
    prisma: {
      auditLog: { create },
    },
  };
});

describe('audit repo', () => {
  it('writes audit log', async () => {
    await writeAudit('p1', 'u1', 'test');
    expect(create).toHaveBeenCalled();
  });

  it('swallows errors', async () => {
    create.mockRejectedValueOnce(new Error('fail'));
    await writeAudit('p1', 'u1', 'test');
    expect(create).toHaveBeenCalled();
  });
});

