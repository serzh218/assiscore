import type { Project } from '@prisma/client';

function makeDiff(path: string, oldContent: string, newContent: string): string {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  let diff = `--- a/${path}\n+++ b/${path}\n@@ -1,${oldLines.length} +1,${newLines.length} @@\n`;
  diff += oldLines.map((l) => `-${l}`).join('\n') + '\n';
  diff += newLines.map((l) => `+${l}`).join('\n') + '\n';
  return diff;
}

function makeNewFileDiff(path: string, content: string): string {
  const lines = content.split('\n');
  let diff = `--- /dev/null\n+++ b/${path}\n@@ -0,0 +1,${lines.length} @@\n`;
  diff += lines.map((l) => `+${l}`).join('\n') + '\n';
  return diff;
}

export async function generatePatchFromMessage(
  _project: Project,
  files: Record<string, string>,
  message: string,
): Promise<string> {
  const lower = message.toLowerCase();
  if (lower.includes('тёмная тема') || lower.includes('темная тема')) {
    const path = 'styles/tokens.css';
    const oldContent = files[path] || '';
    const newContent = oldContent.replace(/--primary:[^;]+;/, '--primary:#1E40AF;');
    return makeDiff(path, oldContent, newContent);
  }
  if (lower.includes('добавь страницу about') || lower.includes('add about page')) {
    const path = 'app/(app)/about/page.tsx';
    const content = `export default function AboutPage() {\n  return <div>About</div>;\n}\n`;
    return makeNewFileDiff(path, content);
  }
  // fallback: insert comment into main page
  const path = 'app/page.tsx';
  const oldContent = files[path] || '';
  const newContent = `// ${message}\n` + oldContent;
  return makeDiff(path, oldContent, newContent);
}
