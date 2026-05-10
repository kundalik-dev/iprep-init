import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { IprepPaths } from '@iprep/shared';
import { checkDbHealth } from '@iprep/db';
import { printBanner, printSeparator, printCommandBadge, printMeta, printStep, log } from '../utils/chalk-helper.js';
import { dirExists } from '../utils/fs.utils.js';
import { isPortInUse } from '../services/server-manager.js';

interface OnboardConfig {
  port: number;
}

// ─── Step 1 ────────────────────────────────────────────────────────────────

async function checkAlreadyOnboarded(yes: boolean): Promise<boolean> {
  if (!dirExists(IprepPaths.root)) return true;

  console.log(log.warn(`iPrep is already set up at ${IprepPaths.root}`));

  if (yes) return true;

  const { proceed } = await inquirer.prompt([{
    type: 'confirm',
    name: 'proceed',
    message: 'Re-run onboard? This will overwrite your .env and re-create any missing directories.',
    default: false,
  }]);

  return proceed as boolean;
}

// ─── Step 2 ────────────────────────────────────────────────────────────────

async function collectUserInput(yes: boolean): Promise<OnboardConfig> {
  if (yes) return { port: 5545 };

  const { port: rawPort } = await inquirer.prompt([{
    type: 'input',
    name: 'port',
    message: 'Server port:',
    default: '5545',
    validate: async (input: string) => {
      const port = parseInt(input, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return 'Port must be a number between 1 and 65535';
      }
      if (await isPortInUse(port)) {
        return `Port ${port} is already in use — choose another`;
      }
      return true;
    },
  }]);

  const config: OnboardConfig = { port: parseInt(rawPort as string, 10) };

  // Summary in Paperclip style
  console.log();
  printStep('Server port', String(config.port));
  printStep('Database',    IprepPaths.dbFile);
  printStep('Config dir',  IprepPaths.root);
  console.log();

  const { confirmed } = await inquirer.prompt([{
    type: 'confirm',
    name: 'confirmed',
    message: 'Proceed with setup?',
    default: true,
  }]);

  if (!confirmed) {
    console.log(log.warn('Onboard cancelled.'));
    process.exit(0);
  }

  return config;
}

// ─── Step 3 ────────────────────────────────────────────────────────────────

function createDirectoryStructure(): void {
  const dirs = [
    { abs: IprepPaths.root,                               label: '~/.iprep/' },
    { abs: IprepPaths.database,                           label: '~/.iprep/database/' },
    { abs: path.join(IprepPaths.root, 'logs'),            label: '~/.iprep/logs/' },
    { abs: path.join(IprepPaths.root, 'sessions'),        label: '~/.iprep/sessions/' },
    { abs: path.join(IprepPaths.root, 'exports'),         label: '~/.iprep/exports/' },
  ];

  for (const dir of dirs) {
    try {
      fs.mkdirSync(dir.abs, { recursive: true });
      console.log(`  ${log.success(dir.label)}`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(
          `Permission denied creating ${dir.abs} — check your home directory permissions`,
        );
      }
      throw err;
    }
  }
}

// ─── Step 4 ────────────────────────────────────────────────────────────────

async function writeEnvFile(config: OnboardConfig, yes: boolean): Promise<void> {
  const dbUrl = `file:${IprepPaths.dbFile.replace(/\\/g, '/')}`;

  const content = [
    `PORT=${config.port}`,
    `NODE_ENV=development`,
    `DATABASE_URL=${dbUrl}`,
    `CORS_ORIGIN=http://localhost:5173`,
    `API_BASE_URL=http://localhost:${config.port}/api/v1`,
  ].join('\n') + '\n';

  if (IprepPaths.isEnvExists && !yes) {
    const { overwrite } = await inquirer.prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: `.env already exists. Overwrite it?`,
      default: false,
    }]);
    if (!overwrite) {
      console.log(`  ${log.warn('.env kept unchanged')}`);
      return;
    }
  }

  fs.writeFileSync(IprepPaths.envFilePath, content, 'utf-8');
  console.log(`  ${log.success('.env written → ' + IprepPaths.envFilePath)}`);
}

// ─── Step 5 ────────────────────────────────────────────────────────────────

function runDbMigration(): void {
  const monorepoRoot = path.dirname(IprepPaths.envFilePath);

  try {
    execSync('pnpm --filter=@iprep/db db:migrate', {
      cwd: monorepoRoot,
      stdio: 'pipe',
    });
    console.log(`  ${log.success('Database migrated')}`);
  } catch (err: unknown) {
    const stderr = (err as { stderr?: Buffer }).stderr?.toString() ?? '';
    console.log(`  ${log.error('Migration failed')}`);

    if (stderr.includes('better-sqlite3')) {
      console.log(chalk.dim('\n  → Native bindings missing. Fix with:'));
      console.log(chalk.dim('    pnpm rebuild better-sqlite3'));
      console.log(chalk.dim('    then re-run: iprep onboard\n'));
    } else {
      console.log(chalk.dim(`\n  → ${stderr.trim()}`));
      console.log(chalk.dim('  → Run manually: pnpm --filter=@iprep/db db:migrate\n'));
    }

    throw new Error('migration failed');
  }
}

// ─── Step 6 ────────────────────────────────────────────────────────────────

async function verifySetup(): Promise<void> {
  const dbHealthy = await checkDbHealth();
  const checks = [
    { label: 'Config dir exists',    ok: dirExists(IprepPaths.root) },
    { label: 'Database dir exists',  ok: dirExists(IprepPaths.database) },
    { label: 'Database file exists', ok: fs.existsSync(IprepPaths.dbFile) },
    { label: 'Database reachable',   ok: dbHealthy },
  ];

  for (const check of checks) {
    console.log(`  ${check.ok ? log.success(check.label) : log.error(check.label)}`);
  }

  if (!dbHealthy) {
    console.log(chalk.dim('\n  → Native bindings missing. Fix with:'));
    console.log(chalk.dim('    pnpm rebuild better-sqlite3'));
    console.log(chalk.dim('    then re-run: iprep onboard\n'));
  }
}

// ─── Step 7 ────────────────────────────────────────────────────────────────

function showCompletionSummary(config: OnboardConfig): void {
  console.log();
  console.log(chalk.bold.green('  ✓  iPrep setup complete!\n'));
  printStep('Config dir', IprepPaths.root);
  printStep('Database',   IprepPaths.dbFile);
  printStep('Port',       String(config.port));
  printStep('API',        `http://localhost:${config.port}/api/v1`);
  console.log();
  console.log(`  ${chalk.cyan('Next:')}  run ${chalk.bold.white('iprep start')} to start the server`);
  console.log();
}

// ─── Orchestrator ──────────────────────────────────────────────────────────

export async function runOnBoard(opts: { yes?: boolean }): Promise<void> {
  const yes = opts.yes ?? false;

  printBanner();
  printSeparator();
  printCommandBadge('iprep onboard');
  printMeta([
    `home: ${IprepPaths.root}`,
    `config: ${IprepPaths.envFilePath}`,
  ]);

  const proceed = await checkAlreadyOnboarded(yes);
  if (!proceed) {
    console.log(log.info('Onboard aborted.'));
    return;
  }

  const config = await collectUserInput(yes);

  console.log(log.bold('\nCreating directories...\n'));
  createDirectoryStructure();

  console.log(log.bold('\nWriting config...\n'));
  await writeEnvFile(config, yes);

  console.log(log.bold('\nSetting up database...\n'));
  try {
    runDbMigration();
  } catch {
    console.log(log.warn('\nSetup incomplete — fix the migration error and re-run iprep onboard'));
    return;
  }

  console.log(log.bold('\nVerifying setup...\n'));
  await verifySetup();

  showCompletionSummary(config);
}
