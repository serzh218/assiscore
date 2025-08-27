import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById } from '@/server/repo/project';
import { getVersion } from '@/server/repo/version';

export async function GET(_req: Request, { params }: { params: { id: string; versionId: string } }) {
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
  const { id, label, createdAt, files } = version;
  return NextResponse.json({ id, label, createdAt, files });
}
