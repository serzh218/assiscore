import { generateFileBundle } from '@/lib/ai/llm';
import { sanitizeAndValidateBundle, TFileBundle } from '@/lib/ai/schema';
import { buildStaticPreview } from './build';
import { updateProjectArtifacts, updateProjectStatus } from '@/server/repo/project';
import { appendGenerationLogs } from '@/server/repo/generation';
import { initGeneration, pushGenerationUpdate, finishGeneration } from '@/server/queue/generationQueue';

export async function runGenerationPipeline({
  user,
  project,
  spec,
  generationId,
}: {
  user: { id: string };
  project: { id: string };
  spec: any;
  generationId?: string;
}): Promise<void> {
  initGeneration(project.id, generationId);
  try {
    await pushGenerationUpdate(project.id, 'plan', 'Анализ запроса, формирование плана');
    await pushGenerationUpdate(project.id, 'draft', 'Черновой дизайн и структура');

    const bundle: TFileBundle = await generateFileBundle(spec);
    await pushGenerationUpdate(project.id, 'files', 'Файлы сгенерированы');

    const sanitized = sanitizeAndValidateBundle(bundle);
    await pushGenerationUpdate(project.id, 'validate', 'Валидация пройдена');

    const preview = await buildStaticPreview({
      projectId: project.id,
      files: sanitized.files,
      binaries: sanitized.binaries,
    });
    await pushGenerationUpdate(project.id, 'build', 'Сборка предпросмотра');

    await updateProjectArtifacts(project.id, {
      files: { ...sanitized.files, '__preview.zip': preview.zipBase64, '__previewPath': preview.htmlPath },
      previewUrl: `/api/projects/${project.id}/preview`,
      status: 'ready',
    });
    await appendGenerationLogs(generationId || '', 'Generation completed\n');
    await finishGeneration(project.id, 'ready', 'Готово');
  } catch (err: any) {
    await updateProjectStatus(project.id, 'error');
    await finishGeneration(project.id, 'error', err?.message || 'Ошибка');
    if (generationId) {
      await appendGenerationLogs(generationId, `ERROR: ${err?.message || err}\n`);
    }
  }
}
