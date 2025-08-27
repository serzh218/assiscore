import { generateDiffBundle } from '@/lib/ai/llm';
import { sanitizeAndValidateDiffs, TDiffBundle } from '@/lib/ai/diffSchema';
import { getProjectFiles, setProjectFiles, touchProjectBuild } from '@/server/repo/project';
import { createPatch } from '@/server/repo/patch';
import { saveVersion } from '@/server/repo/version';
import { spendTokens } from '@/server/guards/limits';
import { enqueueRebuild } from '@/server/queue/generationQueue';
import { COSTS } from '@/lib/limits';

export async function runPatchPipeline({
  user,
  project,
  message,
}: {
  user: { id: string };
  project: { id: string };
  message: string;
}): Promise<string> {
  await touchProjectBuild(project.id, 'building');
  const files = await getProjectFiles(project.id);
  const bundle: TDiffBundle = await generateDiffBundle({ message, files });
  const { updated } = sanitizeAndValidateDiffs(bundle, files);
  const newFiles = { ...files, ...updated };
  await setProjectFiles(project.id, newFiles);
  const patch = await createPatch({
    projectId: project.id,
    diff: JSON.stringify(bundle.diffs),
    notes: bundle.notes,
    status: 'ready',
    costTokens: COSTS.patch,
  });
  const clean = { ...newFiles } as Record<string, string>;
  delete clean['__preview.zip'];
  delete clean['__previewPath'];
  await saveVersion(project.id, user.id, `patch:${patch.id}`, clean);
  await spendTokens(user.id, COSTS.patch, 'patch', { projectId: project.id });
  await enqueueRebuild(project.id, 'patch');
  await touchProjectBuild(project.id, 'ready');
  return patch.id;
}
