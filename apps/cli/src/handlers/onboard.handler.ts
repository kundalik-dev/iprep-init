import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { IprepPaths } from '@iprep/shared';
import { checkDbHealth, runDbMigrations } from '@iprep/db';
import {
  printBanner,
  printSeparator,
  printCommandBadge,
  printMeta,
  printStep,
  log,
} from '../utils/chalk-helper.js';
import { dirExists } from '../utils/fs.utils.js';
import { env } from '../config/env.js';

// Step 1 ---------------------------------------------------------------------

async function checkAlreadyOnboarded(yes: boolean): Promise<boolean> {
  if (!dirExists(IprepPaths.root)) return true;

  console.log(log.warn(`iPrep is already set up at ${IprepPaths.root}`));

  if (yes) return true;

  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message:
        'Re-run onboard? This will overwrite your .env and re-create any missing directories.',
      default: false,
    },
  ]);

  return proceed as boolean;
}

// Step 2 ---------------------------------------------------------------------

async function collectUserInput(yes: boolean): Promise<void> {
  if (yes) return;

  console.log();
  printStep('Root dir', IprepPaths.root);
  printStep('Server port', String(env.PORT));
  printStep('Database', IprepPaths.dbFile);
  console.log();

  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Proceed with setup?',
      default: true,
    },
  ]);

  if (!confirmed) {
    console.log(log.warn('Onboard cancelled.'));
    process.exit(0);
  }
}

// Step 3 ---------------------------------------------------------------------

function createDirectoryStructure(): void {
  const dirs = [
    { abs: IprepPaths.root, label: '~/.iprep/' },
    { abs: IprepPaths.database, label: '~/.iprep/database/' },
    { abs: IprepPaths.logs, label: '~/.iprep/logs/' },
    { abs: IprepPaths.cliLogs, label: '~/.iprep/logs/cli-log/' },
    { abs: IprepPaths.serverLogs, label: '~/.iprep/logs/server-log/' },
    { abs: IprepPaths.sessions, label: '~/.iprep/sessions/' },
    { abs: IprepPaths.skills, label: '~/.iprep/skills/' },
    { abs: IprepPaths.docs, label: '~/.iprep/docs/' },
    { abs: IprepPaths.interviewData, label: '~/.iprep/interview-data/' },
    { abs: IprepPaths.exports, label: '~/.iprep/exports/' },
    { abs: IprepPaths.backups, label: '~/.iprep/backups/' },
  ];

  for (const dir of dirs) {
    try {
      fs.mkdirSync(dir.abs, { recursive: true });
      console.log(`  ${log.success(dir.label)}`);
    } catch (err: unknown) {
      if ((err as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(
          `Permission denied creating ${dir.abs} - check your home directory permissions`,
        );
      }
      throw err;
    }
  }
}

// Step 4 ---------------------------------------------------------------------

async function writeEnvFile(yes: boolean): Promise<void> {
  const dbUrl = `file:${IprepPaths.dbFile.replace(/\\/g, '/')}`;

  const content =
    [
      `PORT=${env.PORT}`,
      `NODE_ENV=${env.NODE_ENV}`,
      `DATABASE_URL=${dbUrl}`,
      `CORS_ORIGIN=${env.CORS_ORIGIN}`,
      `API_BASE_URL=${env.API_BASE_URL}`,
    ].join('\n') + '\n';

  if (IprepPaths.isEnvExists && !yes) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `.env already exists. Overwrite it?`,
        default: false,
      },
    ]);
    if (!overwrite) {
      console.log(`  ${log.warn('.env kept unchanged')}`);
      return;
    }
  }

  fs.writeFileSync(IprepPaths.envFilePath, content, 'utf-8');
  console.log(`  ${log.success('.env written -> ' + IprepPaths.envFilePath)}`);
}

// Step 5 ---------------------------------------------------------------------

async function runDbMigration(): Promise<void> {
  try {
    // Ensure DATABASE_URL is set in the current process environment
    // so it's passed to the migration child process.
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = `file:${IprepPaths.dbFile.replace(/\\/g, '/')}`;
    }

    await runDbMigrations();
    console.log(`  ${log.success('Database migrated')}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  ${log.error('Migration failed')}`);

    if (message.includes('better-sqlite3')) {
      console.log(chalk.dim('\n  -> Native bindings missing. Fix with:'));
      console.log(chalk.dim('    npm rebuild better-sqlite3'));
      console.log(chalk.dim('    then re-run: iprep onboard\n'));
    } else {
      console.log(chalk.dim(`\n  -> ${message.trim()}`));
      console.log(chalk.dim('  -> Re-run: iprep onboard\n'));
    }

    throw new Error('migration failed');
  }
}

// Step 6 ---------------------------------------------------------------------

async function verifySetup(): Promise<void> {
  const dbHealthy = await checkDbHealth();
  const checks = [
    { label: 'Config dir exists', ok: dirExists(IprepPaths.root) },
    { label: 'Database dir exists', ok: dirExists(IprepPaths.database) },
    { label: 'Database file exists', ok: fs.existsSync(IprepPaths.dbFile) },
    { label: 'Database reachable', ok: dbHealthy },
  ];

  for (const check of checks) {
    console.log(`  ${check.ok ? log.success(check.label) : log.error(check.label)}`);
  }

  if (!dbHealthy) {
    console.log(chalk.dim('\n  -> Native bindings missing. Fix with:'));
    console.log(chalk.dim('    npm rebuild better-sqlite3'));
    console.log(chalk.dim('    then re-run: iprep onboard\n'));
  }
}

// Step 7 ---------------------------------------------------------------------

function showCompletionSummary(): void {
  console.log();
  console.log(chalk.bold.green('  OK  iPrep setup complete!\n'));
  printStep('Config dir', IprepPaths.root);
  printStep('Database', IprepPaths.dbFile);
  printStep('Port', String(env.PORT));
  printStep('API', `${env.API_BASE_URL}`);
  console.log();
  console.log(
    `  ${chalk.cyan('Next:')}  run ${chalk.bold.white('iprep start')} to start the server`,
  );
  console.log();
}

// Orchestrator ---------------------------------------------------------------

export async function runOnBoard(opts: { yes?: boolean }): Promise<void> {
  const yes = opts.yes ?? false;

  printBanner();
  printSeparator();
  printCommandBadge('iprep onboard');
  printMeta([`home: ${IprepPaths.root}`, `config: ${IprepPaths.envFilePath}`]);

  const proceed = await checkAlreadyOnboarded(yes);
  if (!proceed) {
    console.log(log.info('Onboard aborted.'));
    return;
  }

  await collectUserInput(yes);

  console.log(log.bold('\nCreating directories...\n'));
  createDirectoryStructure();

  console.log(log.bold('\nWriting config...\n'));
  await writeEnvFile(yes);

  console.log(log.bold('\nSetting up database...\n'));
  try {
    await runDbMigration();
  } catch {
    console.log(log.warn('\nSetup incomplete - fix the migration error and re-run iprep onboard'));
    return;
  }

  console.log(log.bold('\nVerifying setup...\n'));
  await verifySetup();

  showCompletionSummary();
}
