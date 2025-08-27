
export interface Selection {
  start: number;
  end: number;
  content: string;
}

export async function explainCode({ selection }: { selection: Selection }): Promise<{ text: string }> {
  return { text: `Explanation: ${selection.content.slice(0, 60)}` };
}

export async function refactor({ filePath, selection }: { filePath: string; selection?: Selection }): Promise<{ diff: string }> {
  const content = selection ? selection.content : '';
  const oldLines = content.split('\n');
  const newLines = ['// refactored', ...oldLines];
  const diffLines = [
    `--- a/${filePath}`,
    `+++ b/${filePath}`,
    `@@ -1,${oldLines.length} +1,${newLines.length} @@`,
    ...oldLines.map((l) => `-${l}`),
    ...newLines.map((l) => `+${l}`),
  ];
  const diff = diffLines.join('\n') + '\n';
  return { diff };
}

export async function writeTests({ filePath }: { filePath: string }): Promise<{ diff: string }> {
  const testPath = filePath.replace(/\.[^.]+$/, '.test.ts');
  const body = `import { describe, it } from 'vitest';\n\ndescribe('${filePath}', () => {\n  it('works', () => {});\n});`;
  const lines = body.split('\n');
  const diffLines = [
    `--- /dev/null`,
    `+++ b/${testPath}`,
    `@@ -0,0 +1,${lines.length} @@`,
    ...lines.map((l) => `+${l}`),
    '',
  ];
  const diff = diffLines.join('\n');
  return { diff };
}

export async function ask({ question }: { question: string }): Promise<{ text: string }> {
  return { text: `Answer: ${question}` };
}
