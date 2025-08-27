import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById, forkProject } from '@/server/repo/project';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project = await getProjectById(params.id);
  if (!project || project.visibility !== 'public') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const forked = await forkProject({ sourceProjectId: params.id, newOwnerId: user.id });
  return NextResponse.json({ projectId: forked.id });
}
