import chalk from 'chalk';
import { runDbMigrations } from '@iprep/db';
import { log, printCommandBadge, printStep } from '../utils/chalk-helper.js';
import { IprepPaths } from '@iprep/shared';

export async function handleDbMigrate(): Promise<void> {
  printCommandBadge('iprep db migrate');
  console.log(log.bold('\nStarting database migration...\n'));
  
  printStep('Database', IprepPaths.dbFile);
  
  try {
    // Ensure DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = `file:${IprepPaths.dbFile.replace(/\\/g, '/')}`;
    }

    await runDbMigrations();
    console.log(`\n  ${log.success('Database migration completed successfully!')}\n`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`\n  ${log.error('Database migration failed')}`);
    console.log(chalk.dim(`\n  -> ${message.trim()}\n`));
    process.exit(1);
  }
}
