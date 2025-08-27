import { threeWayMerge } from '@/lib/merge';
import { getProjectLight, getProjectFiles, setProjectFiles, getUpstreamInfo, markUpstreamMerged, updateProjectStatus } from '@/server/repo/project';
import { saveSnapshot } from '@/server/repo/snapshot';
import { enqueueRebuild } from '@/server/queue/generationQueue';
import { saveVersion } from '@/server/repo/version';

export async function mergeUpstream({ forkId, userId }: { forkId: string; userId: string }) {
  const project = await getProjectLight(forkId);
  if (!project || project.ownerId !== userId) {
    throw new Error('Forbidden');
  }
  const upstreamInfo = await getUpstreamInfo(forkId);
  if (!upstreamInfo.upstreamId || !upstreamInfo.forkBase) {
    throw new Error('No upstream');
  }
  const ours = await getProjectFiles(forkId);
  const theirs = await getProjectFiles(upstreamInfo.upstreamId);
  const mergeRes = threeWayMerge({ base: upstreamInfo.forkBase, ours, theirs });
  if (mergeRes.conflicts.length > 0) {
    await saveSnapshot(forkId, `pre-merge-CONFLICT`, ours);
    return { ok: false, conflicts: mergeRes.conflicts, changed: mergeRes.changed };
  }
  const mergedFiles = { ...ours };
  for (const p of mergeRes.changed) {
    if (mergeRes.files[p] !== undefined) mergedFiles[p] = mergeRes.files[p];
    else delete mergedFiles[p];
  }
  await saveSnapshot(forkId, `pre-merge`, ours);
  await setProjectFiles(forkId, mergedFiles);
  await updateProjectStatus(forkId, 'building');
  const clean = { ...mergedFiles } as Record<string, string>;
  delete clean["__preview.zip"];
  delete clean["__previewPath"];
  await saveVersion(forkId, userId, "merge", clean);
  await enqueueRebuild(forkId, 'merge');
  await markUpstreamMerged(forkId, new Date());
  return { ok: true, changed: mergeRes.changed };
}
