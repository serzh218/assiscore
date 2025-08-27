import { updateProjectStatus } from '@/server/repo/project';
import { appendGenerationLogs } from '@/server/repo/generation';
import type { ProjectStatus } from '@prisma/client';

interface QueueEntry {
  status: ProjectStatus | string;
  logs: string[];
  updatedAt: number;
}

const queue = new Map<string, QueueEntry>();

export function enqueueGeneration(projectId: string, spec: any, generationId?: string): void {
  const entry: QueueEntry = { status: 'plan', logs: [], updatedAt: Date.now() };
  queue.set(projectId, entry);

  const steps: Array<ProjectStatus | string> = ['plan', 'code', 'test', 'build'];
  let index = 0;

  const run = () => {
    if (index >= steps.length) {
      finalize();
      return;
    }
    const step = steps[index];
    entry.status = step;
    const delay = 2000 + Math.random() * 1000;
    setTimeout(async () => {
      const log = `Step ${step} completed`;
      entry.logs.push(log);
      entry.updatedAt = Date.now();
      if (generationId) {
        await appendGenerationLogs(generationId, log + '\n');
      }
      index++;
      run();
    }, delay);
  };

  const finalize = async () => {
    entry.status = 'ready';
    const log = 'Project ready';
    entry.logs.push(log);
    entry.updatedAt = Date.now();
    if (generationId) {
      await appendGenerationLogs(generationId, log + '\n');
    }
    await updateProjectStatus(projectId, 'ready');
  };

  run();
}

export function getStatus(projectId: string): { status: string; logs: string[] } | null {
  const entry = queue.get(projectId);
  if (!entry) return null;
  return { status: entry.status, logs: entry.logs };
}

export function enqueueRebuild(projectId: string, _reason: 'patch'): void {
  const entry: QueueEntry = { status: 'build', logs: ['Rebuild started (patch)'], updatedAt: Date.now() };
  queue.set(projectId, entry);
  setTimeout(async () => {
    entry.logs.push('Rebuild done');
    entry.status = 'ready';
    entry.updatedAt = Date.now();
    await updateProjectStatus(projectId, 'ready');
  }, 1000);
}
