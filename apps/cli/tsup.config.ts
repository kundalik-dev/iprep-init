import { defineConfig } from 'tsup';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Path from this file to the frontend dist
const FRONTEND_DIST = resolve(__dirname, '../frontend/dist');
const CLI_FRONTEND_OUT = resolve(__dirname, 'dist/frontend');

const PRISMA_DIR = resolve(__dirname, '../../packages/db/prisma');
const CLI_PRISMA_OUT = resolve(__dirname, 'dist/prisma');

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
    async onSuccess() {
      copyFrontend();
      copyPrisma();
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
    outDir: 'dist',
    clean: false,
    dts: false,
    sourcemap: false,
  },
]);
