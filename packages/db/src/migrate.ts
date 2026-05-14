import { execFile } from 'node:child_process';
import { dirname } from 'node:path';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

/**
 * Resolve the directory containing the 'prisma' folder.
 * Works in both monorepo dev and bundled production environments.
 */
function resolvePackageRoot(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const parentDir = dirname(currentDir);

  // In bundled CLI, prisma is at dist/prisma (adjacent to index.js)
  if (fs.existsSync(path.join(currentDir, 'prisma'))) {
    return currentDir;
  }
  // In monorepo packages/db, prisma is at packages/db/prisma (parent of src/ or dist/)
  if (fs.existsSync(path.join(parentDir, 'prisma'))) {
    return parentDir;
  }

  return parentDir;
}

const packageRoot = resolvePackageRoot();
const schemaPath = path.join(packageRoot, 'prisma', 'schema.prisma');

export async function runDbMigrations(): Promise<void> {
  const isWin = process.platform === 'win32';
  const npxBin = isWin ? 'npx.cmd' : 'npx';
  const pnpmBin = isWin ? 'pnpm.cmd' : 'pnpm';

  try {
    // Try npx first as it is almost always available with Node.js
    await execFileAsync(npxBin, ['prisma', 'migrate', 'deploy', '--schema', schemaPath], {
      cwd: packageRoot,
      env: process.env,
      shell: isWin,
    });
  } catch (npxErr: any) {
    // Fallback to pnpm if npx fails
    try {
      await execFileAsync(
        pnpmBin,
        ['exec', 'prisma', 'migrate', 'deploy', '--schema', schemaPath],
        {
          cwd: packageRoot,
          env: process.env,
          shell: isWin,
        },
      );
    } catch (pnpmErr: any) {
      const message = npxErr.message || String(npxErr);
      throw new Error(`Migration failed (tried npx and pnpm). Error: ${message}`);
    }
  }
}
