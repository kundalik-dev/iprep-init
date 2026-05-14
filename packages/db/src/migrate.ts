import { execFile } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));

export async function runDbMigrations(): Promise<void> {
  const isWin = process.platform === 'win32';
  const npxBin = isWin ? 'npx.cmd' : 'npx';
  const pnpmBin = isWin ? 'pnpm.cmd' : 'pnpm';

  try {
    // Try npx first as it is almost always available with Node.js
    await execFileAsync(npxBin, ['prisma', 'migrate', 'deploy'], {
      cwd: packageRoot,
      env: process.env,
      shell: isWin,
    });
  } catch (npxErr: any) {
    // Fallback to pnpm if npx fails
    try {
      await execFileAsync(pnpmBin, ['exec', 'prisma', 'migrate', 'deploy'], {
        cwd: packageRoot,
        env: process.env,
        shell: isWin,
      });
    } catch (pnpmErr: any) {
      const message = npxErr.message || String(npxErr);
      throw new Error(`Migration failed (tried npx and pnpm). Error: ${message}`);
    }
  }
}
