import { execFile } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const packageRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const pnpmBin = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

export async function runDbMigrations(): Promise<void> {
  await execFileAsync(pnpmBin, ['exec', 'prisma', 'migrate', 'deploy'], {
    cwd: packageRoot,
    env: process.env,
  });
}
