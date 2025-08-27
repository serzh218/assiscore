import { appendGenerationLogs } from '@/server/repo/generation';
import { updateProjectStatus } from '@/server/repo/project';

interface QueueEntry {
  status: string;
  logs: string[];
  updatedAt: number;
  generationId?: string;
}

const queue = new Map<string, QueueEntry>();

export function initGeneration(projectId: string, generationId?: string) {
  queue.set(projectId, { status: 'plan', logs: [], updatedAt: Date.now(), generationId });
}

export async function pushGenerationUpdate(projectId: string, status: string, log?: string) {
  const entry = queue.get(projectId);
  if (!entry) return;
  entry.status = status;
  if (log) {
    entry.logs.push(log);
    entry.updatedAt = Date.now();
    if (entry.generationId) {
      await appendGenerationLogs(entry.generationId, log + '\n');
    }
  }
}

export async function finishGeneration(projectId: string, status: string, log?: string) {
  await pushGenerationUpdate(projectId, status, log);
}

export function getStatus(projectId: string): { status: string; logs: string[] } | null {
  const entry = queue.get(projectId);
  if (!entry) return null;
  return { status: entry.status, logs: entry.logs };
}

export async function enqueueRebuild(projectId: string, _reason: string): Promise<void> {
  await updateProjectStatus(projectId, 'ready');
}
