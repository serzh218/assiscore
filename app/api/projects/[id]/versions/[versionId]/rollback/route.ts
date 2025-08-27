import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById, setProjectFiles, touchProjectBuild } from '@/server/repo/project';
import { getVersion, saveVersion } from '@/server/repo/version';
import { enqueueRebuild } from '@/server/queue/generationQueue';

export async function POST(_req: Request, { params }: { params: { id: string; versionId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project = await getProjectById(params.id);
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const version = await getVersion(params.versionId);
  if (!version || version.projectId !== project.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const files = version.files as Record<string, string>;
  const newVersionId = await saveVersion(project.id, user.id, `rollback-to-${version.id}`, files);
  await setProjectFiles(project.id, files);
  await touchProjectBuild(project.id, 'building');
  await enqueueRebuild(project.id, 'rollback');
  return NextResponse.json({ ok: true, newVersionId });
}
