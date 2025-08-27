import { getCurrentUser } from '@/lib/auth';
import { applyUnifiedDiff } from '@/lib/diff';
import { getProjectById, getProjectFiles, setProjectFiles, touchProjectBuild } from '@/server/repo/project';
import { createPatch } from '@/server/repo/patch';
import { makeCodeContext } from '@/server/ai/context';
import { explainCode, refactor, writeTests, ask } from '@/server/ai/skills';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  const body = await req.json();
  const project = await getProjectById(params.id);
  if (!project) return new Response('Not found', { status: 404 });

  await makeCodeContext({
    projectId: params.id,
    filePath: body.filePath,
    selection: body.selection,
    question: body.question,
  });

  let result: any;
  if (body.action === 'explain') {
    result = await explainCode({ selection: body.selection });
  } else if (body.action === 'refactor') {
    result = await refactor({ filePath: body.filePath, selection: body.selection });
  } else if (body.action === 'writeTests') {
    result = await writeTests({ filePath: body.filePath });
  } else if (body.action === 'ask') {
    result = await ask({ question: body.question });
  } else {
    return new Response('Bad action', { status: 400 });
  }

  if (result.diff) {
    const files = await getProjectFiles(params.id);
    const applied = applyUnifiedDiff(files, result.diff);
    await setProjectFiles(params.id, applied.files);
    const patch = await createPatch({ projectId: params.id, diff: result.diff, status: 'ready', costTokens: 0 });
    await touchProjectBuild(params.id, 'building');
    return new Response(JSON.stringify({ ok: true, type: 'diff', answer: result.diff, patchId: patch.id }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true, type: 'text', answer: result.text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
