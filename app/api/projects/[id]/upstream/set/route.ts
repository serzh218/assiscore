import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectLight, getProjectFiles, setForkUpstream } from '@/server/repo/project';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const fork = await getProjectLight(params.id);
  if (!fork || fork.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const body = await req.json();
  const upstreamId = body?.upstreamId;
  if (!upstreamId || typeof upstreamId !== 'string' || upstreamId === params.id) {
    return NextResponse.json({ error: 'Invalid upstream' }, { status: 400 });
  }
  const upstream = await getProjectLight(upstreamId);
  if (!upstream || upstream.visibility !== 'public') {
    return NextResponse.json({ error: 'Invalid upstream' }, { status: 400 });
  }
  await getProjectFiles(params.id); // ensure ours loaded
  const theirs = await getProjectFiles(upstreamId);
  await setForkUpstream(params.id, upstreamId, theirs);
  return NextResponse.json({ ok: true });
}
