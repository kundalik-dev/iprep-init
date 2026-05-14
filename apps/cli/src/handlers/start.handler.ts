import fs from 'node:fs';
import type { ChildProcess } from 'node:child_process';
import chalk from 'chalk';
import { IprepPaths } from '@iprep/shared';
import { checkDbHealth } from '@iprep/db';
import { isPortInUse, startServer, checkHealth } from '../services/server-manager.js';
import {
  log,
  printBanner,
  printSeparator,
  printCommandBadge,
  printMeta,
} from '../utils/chalk-helper.js';
import { dirExists } from '../utils/fs.utils.js';
import { env } from '../config/env.js';

// ─── Step 1 ─────────────────────────────────────────────────────────────────

async function verifyPrerequisites(): Promise<void> {
  const dbHealthy = await checkDbHealth();

  const checks = [
    { label: 'Config dir exists', ok: dirExists(IprepPaths.root) },
    { label: 'Database dir exists', ok: dirExists(IprepPaths.database) },
    { label: 'Database file exists', ok: fs.existsSync(IprepPaths.dbFile) },
    { label: 'Env file exists', ok: IprepPaths.isEnvExists },
    { label: 'Database reachable', ok: dbHealthy },
  ];

  const allOk = checks.every((c) => c.ok);

  if (!allOk) {
    console.log(log.warn('iPrep setup is incomplete:\n'));
    for (const check of checks) {
      console.log(`  ${check.ok ? log.success(check.label) : log.error(check.label)}`);
    }
    console.log();
    console.log(
      chalk.dim("  → If it's your first time, run: ") + chalk.bold.white('iprep onboard'),
    );
    console.log(
      chalk.dim('  → If database is missing tables, run: ') + chalk.bold.white('iprep db migrate'),
    );
    console.log();
    process.exit(1);
  }
}

// ─── Step 2 ─────────────────────────────────────────────────────────────────

function readPort(optsPort?: string): number {
  if (optsPort) {
    const port = parseInt(optsPort, 10);
    if (!isNaN(port) && port > 0 && port <= 65535) {
      return port;
    }
    console.log(log.warn(`Invalid port "${optsPort}" provided. Using default ${env.PORT}.`));
  }
  return env.PORT;
}

// ─── Step 3 ─────────────────────────────────────────────────────────────────

async function guardPortFree(port: number): Promise<void> {
  if (await isPortInUse(port)) {
    console.log(log.error(`Port ${port} is already in use.`));
    console.log(chalk.dim('\n  → Server may already be running. Check: iprep status'));
    console.log(chalk.dim(`  → Or change PORT in: ${IprepPaths.envFilePath}\n`));
    process.exit(1);
  }
}

// ─── Step 4 ─────────────────────────────────────────────────────────────────

function spawnServer(port: number): ChildProcess {
  const child = startServer(port);

  child.stdout?.pipe(process.stdout);
  child.stderr?.pipe(process.stderr);

  child.on('error', (err) => {
    console.log(log.error(`Failed to start server: ${err.message}`));
    console.log(chalk.dim('  → Is pnpm installed? Is @iprep/server built?\n'));
    process.exit(1);
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(log.error(`Server exited unexpectedly (code ${code})`));
      process.exit(1);
    }
  });

  return child;
}

// ─── Step 5 ─────────────────────────────────────────────────────────────────

async function waitForReady(maxWaitMs = 15_000): Promise<void> {
  const interval = 500;
  const maxAttempts = Math.ceil(maxWaitMs / interval);

  process.stdout.write(log.info('Waiting for server'));

  for (let i = 0; i < maxAttempts; i++) {
    if (await checkHealth()) {
      process.stdout.write('\n');
      console.log(`  ${log.success('Server is up')}`);
      return;
    }
    process.stdout.write(chalk.dim('.'));
    await new Promise<void>((r) => setTimeout(r, interval));
  }

  process.stdout.write('\n');
  throw new Error(`Server did not become healthy within ${maxWaitMs / 1000}s`);
}

// ─── Step 6 ─────────────────────────────────────────────────────────────────

function showRunningBanner(port: number): void {
  const col = (s: string) => chalk.dim(s.padEnd(12));
  console.log();
  console.log(chalk.bold.green('  ✓  iPrep is running\n'));
  console.log(`  ${col('Frontend')}  ${chalk.cyan(`http://localhost:${port}`)}`);
  console.log(`  ${col('API')}  ${chalk.cyan(`http://localhost:${port}/api/v1`)}`);
  console.log();
  console.log(`  ${chalk.dim('Press Ctrl+C to stop')}`);
  console.log();
}

// ─── Step 7 ─────────────────────────────────────────────────────────────────

function attachShutdownHook(child: ChildProcess): void {
  process.on('SIGINT', () => {
    console.log('\n' + log.warn('Shutting down server...'));
    child.kill('SIGTERM');
    process.exit(0);
  });
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

export async function runStart(opts: { port?: string; open?: boolean }): Promise<void> {
  printBanner();
  printSeparator();
  printCommandBadge('iprep start');

  const port = readPort(opts.port);

  printMeta([`port: ${port}`, `server: http://localhost:${port}`, `db: ${IprepPaths.dbFile}`]);

  await verifyPrerequisites();

  await guardPortFree(port);

  console.log(log.bold(`\nStarting iPrep server on port ${port}...\n`));

  const child = spawnServer(port);

  try {
    await waitForReady();
  } catch (err: unknown) {
    console.log(log.error((err as Error).message));
    console.log(chalk.dim('  → Check server logs above for errors\n'));
    child.kill('SIGTERM');
    process.exit(1);
  }

  showRunningBanner(port);

  if (opts.open !== false) {
    const open = (await import('open')).default;
    await open(`http://localhost:${port}`).catch(() => {
      console.log(log.warn('Could not open browser automatically.'));
    });
  }

  attachShutdownHook(child);
}
