import { defineConfig } from 'tsup';

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
  },
  // Server entry — bundled alongside the CLI so it can be spawned at runtime
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
