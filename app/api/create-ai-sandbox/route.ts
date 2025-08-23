import { NextResponse } from 'next/server';
import { Sandbox, type WriteEntry } from '@e2b/code-interpreter';
import type { SandboxState } from '@/types/sandbox';
import { appConfig } from '@/config/app.config';
import fs from 'fs';
import path from 'path';

// Store active sandbox globally
declare global {
  // eslint-disable-next-line no-var
  var activeSandbox: any;
  // eslint-disable-next-line no-var
  var sandboxData: any;
  // eslint-disable-next-line no-var
  var existingFiles: Set<string>;
  // eslint-disable-next-line no-var
  var sandboxState: SandboxState;
}

function collectTemplateFiles(dir: string, baseDir: string = dir): WriteEntry[] {
  const entries: WriteEntry[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      entries.push(...collectTemplateFiles(fullPath, baseDir));
    } else {
      const rel = path.relative(baseDir, fullPath);
      entries.push({
        path: `/home/user/app/${rel}`.replace(/\\/g, '/'),
        data: fs.readFileSync(fullPath, 'utf-8')
      });
    }
  }
  return entries;
}

export async function POST(request: Request) {
  let sandbox: any = null;
  let projectType = 'website';

  try {
    try {
      const body = await request.json();
      if (body?.projectType) projectType = body.projectType;
    } catch {}

    console.log('[create-ai-sandbox] Creating base sandbox...');

    // Kill existing sandbox if any
    if (global.activeSandbox) {
      console.log('[create-ai-sandbox] Killing existing sandbox...');
      try {
        await global.activeSandbox.kill();
      } catch (e) {
        console.error('Не удалось закрыть существующую песочницу:', e);
      }
      global.activeSandbox = null;
    }

    // Clear existing files tracking
    if (global.existingFiles) {
      global.existingFiles.clear();
    } else {
      global.existingFiles = new Set<string>();
    }

    // Create base sandbox
    console.log(`[create-ai-sandbox] Creating base E2B sandbox with ${appConfig.e2b.timeoutMinutes} minute timeout...`);
    sandbox = await Sandbox.create({
      apiKey: process.env.E2B_API_KEY,
      timeoutMs: appConfig.e2b.timeoutMs
    });

    const sandboxId = (sandbox as any).sandboxId || Date.now().toString();
    const host = (sandbox as any).getHost(appConfig.e2b.vitePort);

    console.log(`[create-ai-sandbox] Sandbox created: ${sandboxId}`);
    console.log(`[create-ai-sandbox] Sandbox host: ${host}`);

    // Upload template files
    console.log(`[create-ai-sandbox] Uploading ${projectType} template...`);
    const templateDir = path.join(process.cwd(), 'templates', projectType);
    if (!fs.existsSync(templateDir)) {
      throw new Error(`Template not found for project type: ${projectType}`);
    }
    const files = collectTemplateFiles(templateDir);
    await sandbox.files.write(files);

    // Track initial files
    for (const file of files) {
      const relPath = file.path.replace('/home/user/app/', '');
      global.existingFiles.add(relPath);
    }

    // Install dependencies
    console.log('[create-ai-sandbox] Installing dependencies...');
    const installCmd = `npm install${appConfig.packages.useLegacyPeerDeps ? ' --legacy-peer-deps' : ''}`;
    await sandbox.commands.run(installCmd, { cwd: '/home/user/app' });

    // Start project
    const startCmd = projectType === 'bot' ? 'npm start' : 'npm run dev';
    console.log(`[create-ai-sandbox] Starting project with: ${startCmd}`);
    await sandbox.commands.run(startCmd, { cwd: '/home/user/app', background: true });

    if (projectType !== 'bot') {
      await new Promise(resolve => setTimeout(resolve, appConfig.e2b.viteStartupDelay));
    }

    // Store sandbox globally
    global.activeSandbox = sandbox;
    global.sandboxData = {
      sandboxId,
      url: `https://${host}`,
      projectType
    };

    // Set extended timeout on the sandbox instance if method available
    if (typeof sandbox.setTimeout === 'function') {
      sandbox.setTimeout(appConfig.e2b.timeoutMs);
      console.log(`[create-ai-sandbox] Set sandbox timeout to ${appConfig.e2b.timeoutMinutes} minutes`);
    }

    // Initialize sandbox state
    global.sandboxState = {
      fileCache: {
        files: {},
        lastSync: Date.now(),
        sandboxId
      },
      sandbox,
      sandboxData: {
        sandboxId,
        url: `https://${host}`,
        projectType
      }
    };

    console.log('[create-ai-sandbox] Sandbox ready at:', `https://${host}`);

    return NextResponse.json({
      success: true,
      sandboxId,
      url: `https://${host}`,
      projectType,
      message: 'Sandbox created'
    });
  } catch (error) {
    console.error('[create-ai-sandbox] Error:', error);

    // Clean up on error
    if (sandbox) {
      try {
        await sandbox.kill();
      } catch (e) {
        console.error('Не удалось закрыть песочницу при ошибке:', e);
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Не удалось создать песочницу',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
