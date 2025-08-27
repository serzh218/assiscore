import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { estimateGenerationCost } from '@/lib/tokens';
import { assertCanGenerate, spendTokens } from '@/server/guards/limits';
import { createProject } from '@/server/repo/project';
import { createGeneration } from '@/server/repo/generation';
import { enqueueGeneration } from '@/server/queue/generationQueue';
import type { Visibility } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, figmaUrl, private: isPrivate, attachments } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const estimatedCost = estimateGenerationCost({ textLen: prompt.length, hasFigma: !!figmaUrl });
    await assertCanGenerate(user.id, estimatedCost);

    const attachmentsMeta = Array.isArray(attachments)
      ? attachments.map((a: any) => ({ name: a.name, type: a.type }))
      : undefined;

    const project = await createProject({
      ownerId: user.id,
      visibility: (isPrivate ? 'private' : 'public') as Visibility,
      title: prompt.slice(0, 50) || 'Новый проект',
      type: 'site',
      spec: { prompt, figmaUrl, attachmentsMeta },
    });

    const generation = await createGeneration({
      projectId: project.id,
      costTokens: estimatedCost,
      logs: '',
    });

    await spendTokens(user.id, estimatedCost, 'generation', { projectId: project.id });

    enqueueGeneration(project.id, project.spec, generation.id);

    return NextResponse.json({ projectId: project.id });
  } catch (err: any) {
    console.error('[generate] error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
