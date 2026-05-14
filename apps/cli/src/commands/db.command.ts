import { Command } from 'commander';
import { handleDbMigrate } from '../handlers/db.handler.js';

export function register(program: Command): void {
  const db = program.command('db').description('Database management commands');

  db.command('migrate')
    .description('Run pending database migrations')
    .action(async () => {
      await handleDbMigrate();
    });
}
