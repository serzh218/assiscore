import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectById } from '@/server/repo/project';
import { listPatches } from '@/server/repo/patch';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project = await getProjectById(params.id);
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const patches = await listPatches(project.id);
  return NextResponse.json({ patches: patches.map(p => ({ id: p.id, status: p.status, notes: p.notes, costTokens: p.costTokens, createdAt: p.createdAt })) });
}
