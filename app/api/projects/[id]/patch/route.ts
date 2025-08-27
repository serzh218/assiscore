import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { estimatePatchCost } from '@/lib/tokens';
import { spendTokens } from '@/server/guards/limits';
import { getProjectById, getProjectFiles, setProjectFiles, touchProjectBuild } from '@/server/repo/project';
import { createPatch } from '@/server/repo/patch';
import { applyUnifiedDiff } from '@/lib/diff';
import { generatePatchFromMessage } from '@/server/patch/mockPatchGenerator';
import { enqueueRebuild } from '@/server/queue/generationQueue';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const project = await getProjectById(params.id);
    if (!project || project.ownerId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const cost = estimatePatchCost();
    if (user.tokens < cost) {
      return NextResponse.json({ error: 'Недостаточно токенов' }, { status: 402 });
    }

    const files = await getProjectFiles(project.id);
    const diff = await generatePatchFromMessage(project as any, files, message);
    if (!diff) return NextResponse.json({ error: 'Empty diff' }, { status: 400 });

    const updated = applyUnifiedDiff(files, diff);

    await spendTokens(user.id, cost, 'patch', { projectId: project.id });
    await setProjectFiles(project.id, updated.files);
    await createPatch({ projectId: project.id, diff, costTokens: cost });
    await touchProjectBuild(project.id, 'building');
    enqueueRebuild(project.id, 'patch');

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === 'INVALID_DIFF') {
      return NextResponse.json({ error: 'Invalid diff' }, { status: 400 });
    }
    console.error('[patch]', e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
