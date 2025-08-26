/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { Sandbox, type WriteEntry } from '@e2b/code-interpreter';
import fs from 'fs';
import path from 'path';
import { appConfig } from '@/config/app.config';
import { writeOpenRouterEnvFile } from '@/server/routes/sandbox';

function collectTemplateFiles(dir: string, baseDir: string = dir): WriteEntry[] {
  const entries: WriteEntry[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      entries.push(...collectTemplateFiles(full, baseDir));
    } else {
      const rel = path.relative(baseDir, full);
      entries.push({ path: `/home/user/app/${rel}`.replace(/\\/g, '/'), data: fs.readFileSync(full, 'utf-8') });
    }
  }
  return entries;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, projectType = 'website', model } = await req.json();
    if (!prompt) {
      return NextResponse.json({ success: false, error: 'Prompt is required' }, { status: 400 });
    }

    const sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      timeoutMs: appConfig.e2b.timeoutMs
    });
    const sandboxId = (sandbox as any).sandboxId || Date.now().toString();
    const host = (sandbox as any).getHost(appConfig.e2b.vitePort);

    const templateDir = path.join(process.cwd(), 'templates', projectType);
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template not found for project type: ${projectType}`);
    }
    const files = collectTemplateFiles(templateDir);
    await sandbox.files.write(files);

    if (projectType === 'bot') {
      await writeOpenRouterEnvFile(sandbox as any);
    }

    const installCmd = `npm install${appConfig.packages.useLegacyPeerDeps ? ' --legacy-peer-deps' : ''}`;
    await sandbox.commands.run(installCmd, { cwd: '/home/user/app' });
    const startCmd = projectType === 'bot' ? 'npm start' : 'npm run dev';
    await sandbox.commands.run(startCmd, { cwd: '/home/user/app', background: true });
    if (projectType !== 'bot') {
      await new Promise(r => setTimeout(r, appConfig.e2b.viteStartupDelay));
    }

    global.activeSandbox = sandbox;
    global.sandboxData = { sandboxId, url: `https://${host}`, projectType };
    global.sandboxState = {
      fileCache: { files: {}, lastSync: Date.now(), sandboxId },
      sandbox,
      sandboxData: { sandboxId, url: `https://${host}`, projectType }
    } as any;

    const initialPrompt = `Ты — эксперт по React. Вот пустой проект. Сгенерируй код на основе следующего запроса пользователя: ${prompt}`;

    const aiRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-ai-code-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: initialPrompt,
        model: model || appConfig.ai.defaultModel,
        context: { sandboxId },
        projectType
      })
    });

    if (!aiRes.body) {
      throw new Error('AI response missing body');
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    await writer.write(encoder.encode(`data: ${JSON.stringify({ type: 'sandbox', sandboxId, url: `https://${host}` })}\n\n`));

    const reader = aiRes.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      await writer.write(value);
    }
    await writer.close();

    return new NextResponse(stream.readable, {
      headers: { 'Content-Type': 'text/event-stream' }
    });
  } catch (err: any) {
    console.error('[generate-project] Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to generate project' }, { status: 500 });
  }
}
