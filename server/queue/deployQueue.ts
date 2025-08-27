import { updateProjectArtifacts } from '@/server/repo/project';
import type { DeployProvider } from '@/server/integrations/deploy';

interface QueueEntry {
  status: 'upload' | 'provision' | 'activate' | 'done' | 'error';
  logs: string[];
  updatedAt: Date;
}

const queue = new Map<string, QueueEntry>();

export function enqueueDeployment(projectId: string, _task: { provider: DeployProvider; domain?: string | null }): void {
  const entry: QueueEntry = { status: 'upload', logs: [], updatedAt: new Date() };
  queue.set(projectId, entry);

  const steps: QueueEntry['status'][] = ['upload', 'provision', 'activate', 'done'];
  let index = 0;

  const run = () => {
    if (index >= steps.length) return;
    const step = steps[index];
    entry.status = step;
    const delay = 1000 + Math.random() * 1000;
    setTimeout(async () => {
      const log = `[${new Date().toISOString()}] ${step} step completed`;
      entry.logs.push(log);
      entry.updatedAt = new Date();
      if (step === 'done') {
        await updateProjectArtifacts(projectId, {
          status: 'ready',
          lastDeployedAt: new Date(),
        });
        return;
      }
      index++;
      run();
    }, delay);
  };

  run();
}

export function getDeployStatus(projectId: string): { stepStatus: string; logs: string[] } | null {
  const entry = queue.get(projectId);
  if (!entry) return null;
  return { stepStatus: entry.status, logs: entry.logs };
}
