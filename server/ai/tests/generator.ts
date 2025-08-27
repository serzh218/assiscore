import { generateFileBundle } from '@/lib/ai/llm'
import { makeCodeContext } from '@/server/ai/context'

interface GenerateArgs {
  projectId: string
  targetPath?: string
  selection?: { start: number; end: number; content: string }
  prompt?: string
}

export async function generateTests({
  projectId,
  targetPath,
  selection,
  prompt,
}: GenerateArgs): Promise<Record<string, string>> {
  const { content } = await makeCodeContext({
    projectId,
    filePath: targetPath,
    selection,
    question: prompt,
  })
  const userPrompt = [
    'Напиши только тестовые файлы, без кода приложения. Используй Vitest.',
    'Тесты должны быть маленькими и детерминированными, без сетевых вызовов.',
    selection ? 'Пиши тест для выделенного блока.' : '',
    prompt || '',
    'Контекст:',
    content,
  ]
    .filter(Boolean)
    .join('\n\n')
  const bundle = await generateFileBundle({ prompt: userPrompt, styleGuide: {} })
  const files: Record<string, string> = {}
  for (const f of bundle.files) {
    files[f.path] = f.content
  }
  return files
}
