import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { token, repoName, zipData } = await request.json();

    if (!token || !repoName || !zipData) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Ensure unzip is available
    try {
      execSync('unzip -v', { stdio: 'ignore' });
    } catch {
      return NextResponse.json({
        success: false,
        error: 'unzip command not found on server'
      }, { status: 500 });
    }

    // Create repository via GitHub API
    const createResp = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'assiscore'
      },
      body: JSON.stringify({ name: repoName, private: false, auto_init: false })
    });

    if (!createResp.ok) {
      const text = await createResp.text();
      return NextResponse.json({
        success: false,
        error: `Failed to create repo: ${text}`
      }, { status: createResp.status });
    }

    const repo = await createResp.json();

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'export-'));
    const zipPath = path.join(tmpDir, 'project.zip');

    const base64 = zipData.includes(',') ? zipData.split(',')[1] : zipData;
    fs.writeFileSync(zipPath, Buffer.from(base64, 'base64'));

    execSync(`unzip ${zipPath} -d ${tmpDir}`);

    execSync('git init', { cwd: tmpDir });
    execSync('git add .', { cwd: tmpDir });
    execSync('git commit -m "Initial commit"', { cwd: tmpDir });
    execSync('git branch -M main', { cwd: tmpDir });
    execSync(`git remote add origin ${repo.clone_url}`, { cwd: tmpDir });
    execSync('git push -u origin main', { cwd: tmpDir });

    fs.rmSync(tmpDir, { recursive: true, force: true });

    return NextResponse.json({ success: true, url: repo.html_url });
  } catch (error) {
    console.error('[export/github] Error:', error);
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 });
  }
}
