import JSZip from 'jszip';

export async function buildStaticPreview({
  projectId,
  files,
  binaries,
}: {
  projectId: string;
  files: Record<string, string>;
  binaries: Record<string, Uint8Array>;
}): Promise<{ htmlPath: string; zipBase64: string }> {
  const workFiles: Record<string, string> = { ...files };
  let htmlPath = 'index.html';
  if (!workFiles[htmlPath]) {
    workFiles[htmlPath] = '<html><body><h1>Preview</h1></body></html>';
  }
  const zip = new JSZip();
  for (const [p, c] of Object.entries(workFiles)) {
    zip.file(p, c);
  }
  for (const [p, b] of Object.entries(binaries)) {
    zip.file(p, b);
  }
  const zipBase64 = await zip.generateAsync({ type: 'base64' });
  return { htmlPath, zipBase64 };
}
