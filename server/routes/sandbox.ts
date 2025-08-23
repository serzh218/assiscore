import fs from 'fs';
import path from 'path';
import type { Sandbox } from '@e2b/code-interpreter';

/**
 * Writes the OPENROUTER API key to the sandbox's /home/user/.env file.
 * The file is recreated on each sandbox start to ensure the key is current.
 */
export async function writeOpenRouterEnvFile(sandbox: Sandbox) {
  const envContent = `OPENROUTER_API_KEY="${process.env.OPENROUTER_API_KEY || ''}"`;
  const tempFile = path.join(process.cwd(), '.openrouter.env');

  fs.writeFileSync(tempFile, envContent);
  const data = fs.readFileSync(tempFile, 'utf-8');
  await sandbox.files.write([
    {
      path: path.posix.join('/home', 'user', '.env'),
      data,
    },
  ]);
  fs.unlinkSync(tempFile);
}
