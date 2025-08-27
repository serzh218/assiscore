import { NotificationType } from '@prisma/client';
import { createNotification, getPreferences } from '@/server/repo/notification';

export type NotifyJob = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
  emailHint?: {
    subject?: string;
    ctaUrl?: string;
  };
};

const queue: NotifyJob[] = [];
const emailQueue: any[] = [];
export const __emailQueue = emailQueue; // for tests
const recent = new Map<string, number>();

function prefAllows(prefs: any, type: NotificationType): boolean {
  switch (type) {
    case 'GENERATION_READY':
      return prefs.genReady;
    case 'GENERATION_ERROR':
      return prefs.genError;
    case 'PATCH_READY':
      return prefs.patchReady;
    case 'PATCH_ERROR':
      return prefs.patchError;
    case 'DEPLOY_READY':
      return prefs.deployReady;
    case 'DEPLOY_ERROR':
      return prefs.deployError;
    case 'BILLING_CREATED':
    case 'BILLING_SUCCEEDED':
    case 'BILLING_CANCELED':
      return prefs.billing;
    default:
      return false;
  }
}

async function worker() {
  const job = queue.shift();
  if (!job) return;
  try {
    await createNotification(job.userId, {
      type: job.type,
      title: job.title,
      body: job.body,
      data: job.data
    });
    const prefs = await getPreferences(job.userId);
    if (prefs.emailOn && prefAllows(prefs, job.type)) {
      emailQueue.push({ job, prefs });
    }
  } catch (e) {
    console.error('notifyQueue error', e);
  }
}

setInterval(worker, 50);

export function enqueueNotify(job: NotifyJob): void {
  const key = job.userId + ':' + job.type + ':' + (job.data?.projectId ?? '');
  const now = Date.now();
  for (const [k, t] of recent) {
    if (now - t > 60000) recent.delete(k);
  }
  if (recent.has(key)) return;
  recent.set(key, now);
  if (recent.size > 100) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    for (const [k, t] of recent) {
      if (t < oldestTime) {
        oldestTime = t;
        oldestKey = k;
      }
    }
    if (oldestKey) recent.delete(oldestKey);
  }
  queue.push(job);
}
