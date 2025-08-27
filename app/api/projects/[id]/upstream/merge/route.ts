import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectLight } from '@/server/repo/project';
import { mergeUpstream } from '@/server/merge/orchestrator';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project = await getProjectLight(params.id);
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const res = await mergeUpstream({ forkId: params.id, userId: user.id });
    return NextResponse.json(res);
  } catch (e) {
    return NextResponse.json({ error: 'Merge failed' }, { status: 400 });
  }
}
