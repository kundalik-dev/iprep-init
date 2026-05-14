import { defineConfig } from 'tsup';
import { cpSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Path from this file to the frontend dist
const FRONTEND_DIST = resolve(__dirname, '../frontend/dist');
const CLI_FRONTEND_OUT = resolve(__dirname, 'dist/frontend');

const PRISMA_DIR = resolve(__dirname, '../../packages/db/prisma');
const CLI_PRISMA_OUT = resolve(__dirname, 'dist/prisma');

const PRISMA_CONFIG = resolve(__dirname, '../../packages/db/prisma.config.ts');
const CLI_PRISMA_CONFIG_OUT = resolve(__dirname, 'dist/prisma.config.ts');

function copyFrontend() {
  if (existsSync(FRONTEND_DIST)) {
    cpSync(FRONTEND_DIST, CLI_FRONTEND_OUT, { recursive: true, force: true });
    console.log('[tsup] ✓ Copied frontend dist → dist/frontend');
  } else {
    console.warn(
      '[tsup] ⚠ Frontend dist not found — run "pnpm --filter @iprep/frontend build" first',
    );
  }
}

function copyPrisma() {
  if (existsSync(PRISMA_DIR)) {
    cpSync(PRISMA_DIR, CLI_PRISMA_OUT, { recursive: true, force: true });
    console.log('[tsup] ✓ Copied prisma schema → dist/prisma');
  } else {
    console.warn('[tsup] ⚠ Prisma directory not found in packages/db');
  }
}

function copyPrismaConfig() {
  if (existsSync(PRISMA_CONFIG)) {
    cpSync(PRISMA_CONFIG, CLI_PRISMA_CONFIG_OUT, { force: true });
    console.log('[tsup] ✓ Copied prisma.config.ts → dist/prisma.config.ts');
  }
}

export default defineConfig([
  // CLI entry — bundles @iprep/shared and @iprep/db; keeps npm deps external
  {
    entry: { index: 'src/index.ts' },
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    noExternal: ['@iprep/shared', '@iprep/db'],
    outDir: 'dist',
    clean: true,
    dts: false,
    sourcemap: false,
    shims: true,
    async onSuccess() {
      copyFrontend();
      copyPrisma();
      copyPrismaConfig();
    },
  },
  // Server entry — bundled alongside the CLI so it can be spawned at runtime
  // The server resolves dist/frontend at runtime for static file serving
  {
    entry: { server: '../server/src/server.ts' },
    format: ['esm'],
    target: 'node20',
    platform: 'node',
    noExternal: ['@iprep/shared', '@iprep/db'],
    external: ['express', 'multer', 'cors', 'bcryptjs', 'dotenv'],
    outDir: 'dist',
    clean: false,
    dts: false,
    sourcemap: false,
    shims: true,
  },
]);
