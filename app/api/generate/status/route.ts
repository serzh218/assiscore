import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById } from '@/server/repo/project';
import { listGenerations } from '@/server/repo/generation';
import { getStatus } from '@/server/queue/generationQueue';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const project = await getProjectById(projectId);
    if (!project || (project.ownerId !== user.id && project.visibility !== 'public')) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const inMem = getStatus(projectId);
    if (inMem) {
      return NextResponse.json(inMem);
    }

    const gens = await listGenerations(projectId);
    const logs = gens.length ? gens[gens.length - 1].logs.split('\n').filter(Boolean) : [];
    return NextResponse.json({ status: project.status, logs });
  } catch (err) {
    console.error('[generate/status] error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
