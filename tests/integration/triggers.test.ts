import { describe, it, expect, vi } from 'vitest';
import { NotificationType } from '@prisma/client';

const createNotification = vi.fn(async () => ({ id: 'n1' }));
const getPreferences = vi.fn(async () => ({
  userId: 'u1',
  emailOn: true,
  locale: 'ru',
  genReady: true,
  genError: true,
  patchReady: true,
  patchError: true,
  deployReady: true,
  deployError: true,
  billing: true,
}));

vi.mock('@/server/repo/notification', () => ({
  createNotification,
  getPreferences,
}));

describe('notify queue', () => {
  it('creates notification and prepares email', async () => {
    const { enqueueNotify, __emailQueue } = await import('@/server/queue/notifyQueue');
    enqueueNotify({
      userId: 'u1',
      type: NotificationType.GENERATION_READY,
      title: 't',
      body: 'b',
      data: { projectId: 'p1' },
    });
    await new Promise((r) => setTimeout(r, 100));
    expect(createNotification).toHaveBeenCalled();
    expect(__emailQueue.length).toBe(1);
  });
});
