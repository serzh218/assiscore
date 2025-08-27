import fs from 'node:fs/promises';
import path from 'node:path';
import axios from 'axios';
import { FileBundle, TFileBundle } from './schema';

interface Attachment {
  name: string;
  type: string;
  contentBase64: string;
}

interface GenerateParams {
  prompt: string;
  figmaUrl?: string;
  attachments?: Attachment[];
  styleGuide: any;
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function buildSystemPrompt(style: string): string {
  return (
    'Ты — кодогенератор. Верни ТОЛЬКО валидный JSON по схеме FileBundle (files:[{path,content,binaryBase64?}], notes?) без Markdown. ' +
    'Генерируй статический сайт, самодостаточный, без внешних зависимостей. ' +
    'Соблюдай Style Guide (цвета/типо/радиусы).\n' +
    style
  );
}

async function buildUserPrompt(params: GenerateParams): Promise<string> {
  const tokensPath = path.join(process.cwd(), 'styles', 'tokens.css');
  let tokens = '';
  try {
    tokens = await fs.readFile(tokensPath, 'utf8');
  } catch {
    // ignore
  }
  const attachNames = params.attachments?.map((a) => a.name).join(', ') || 'нет';
  return [
    params.prompt,
    params.figmaUrl ? `Figma: ${params.figmaUrl}` : '',
    `Вложения: ${attachNames}`,
    'Style Guide:',
    tokens,
    'Требования доступности: WCAG, семантическая разметка.',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function generateFileBundle(params: GenerateParams): Promise<TFileBundle> {
  const system = buildSystemPrompt('');
  const user = await buildUserPrompt(params);
  const headers = {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  } as Record<string, string>;

  let lastErr: any = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await axios.post(
        OPENROUTER_URL,
        {
          model: 'gpt-4.1-mini',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: { type: 'json_object' },
        },
        { timeout: 90_000, headers }
      );
      const content = res.data.choices?.[0]?.message?.content || '{}';
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      const json = content.slice(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(json);
      return FileBundle.parse(parsed);
    } catch (err: any) {
      lastErr = err;
      if (err.response && err.response.status >= 500) {
        continue;
      }
      break;
    }
  }
  throw lastErr || new Error('Failed to generate bundle');
}
