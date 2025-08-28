import { prisma } from '@/lib/db'
import { NotificationType } from '@prisma/client'
import type { NotificationDTO, NotificationPreferenceDTO } from '@/types/domain'

export async function createNotification(
  userId: string,
  input: { type: NotificationType; title: string; body: string; data?: any },
): Promise<NotificationDTO> {
  const rec = await prisma.notification.create({
    data: { userId, ...input },
  })
  return {
    id: rec.id,
    type: rec.type,
    title: rec.title,
    body: rec.body,
    data: rec.data ?? undefined,
    readAt: rec.readAt ?? undefined,
    createdAt: rec.createdAt,
  }
}

export async function listNotifications(
  userId: string,
  { limit = 20, cursor }: { limit?: number; cursor?: string },
): Promise<{ items: NotificationDTO[]; nextCursor: string | null; total: number }> {
  const [records, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
    }),
    prisma.notification.count({ where: { userId } }),
  ])
  const items = records.slice(0, limit).map((rec) => ({
    id: rec.id,
    type: rec.type,
    title: rec.title,
    body: rec.body,
    data: rec.data ?? undefined,
    readAt: rec.readAt ?? undefined,
    createdAt: rec.createdAt,
  }))
  const nextCursor = records.length > limit ? records[limit].id : null
  return { items, nextCursor, total }
}

export async function markRead(userId: string, ids: string[]): Promise<void> {
  if (!ids.length) return
  await prisma.notification.updateMany({
    where: { userId, id: { in: ids } },
    data: { readAt: new Date() },
  })
}

export async function markAllRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  })
}

export async function getPreferences(userId: string): Promise<NotificationPreferenceDTO> {
  const prefs = await prisma.notificationPreference.findUnique({ where: { userId } })
  if (prefs) {
    const {
      userId: uid,
      emailOn,
      locale,
      genReady,
      genError,
      patchReady,
      patchError,
      deployReady,
      deployError,
      billing,
    } = prefs
    return {
      userId: uid,
      emailOn,
      locale,
      genReady,
      genError,
      patchReady,
      patchError,
      deployReady,
      deployError,
      billing,
    }
  }
  // create default record
  const created = await prisma.notificationPreference.create({
    data: { userId },
  })
  const {
    userId: uid2,
    emailOn,
    locale,
    genReady,
    genError,
    patchReady,
    patchError,
    deployReady,
    deployError,
    billing,
  } = created
  return {
    userId: uid2,
    emailOn,
    locale,
    genReady,
    genError,
    patchReady,
    patchError,
    deployReady,
    deployError,
    billing,
  }
}

export async function upsertPreferences(
  userId: string,
  patch: Partial<NotificationPreferenceDTO>,
): Promise<NotificationPreferenceDTO> {
  const updated = await prisma.notificationPreference.upsert({
    where: { userId },
    update: patch as any,
    create: { userId, ...(patch as any) },
  })
  const {
    userId: uid,
    emailOn,
    locale,
    genReady,
    genError,
    patchReady,
    patchError,
    deployReady,
    deployError,
    billing,
  } = updated
  return {
    userId: uid,
    emailOn,
    locale,
    genReady,
    genError,
    patchReady,
    patchError,
    deployReady,
    deployError,
    billing,
  }
}
