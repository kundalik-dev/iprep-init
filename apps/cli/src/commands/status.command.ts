import { Command } from 'commander';
import chalk from 'chalk';
import { checkHealth } from '../services/server-manager.js';
import { log } from '../utils/chalk-helper.js';
import { env } from '../config/env.js';

export function register(program: Command): void {
  program
    .command('status')
    .description('Check server health and environment status')
    .action(async () => {
      console.log(log.bold('\niPrep System Status\n'));

      const serverUp = await checkHealth();
      const label = (s: string) => chalk.dim(s.padEnd(10));

      console.log(
        `  ${label('Server')}  ${serverUp ? log.success('Running') : log.error('Not running — run: iprep start')}`,
      );
      console.log(`  ${label('URL')}  ${chalk.cyan(env.API_BASE_URL)}`);

      console.log();

      console.log(
        `  ${label('Mode')}  ${env.NODE_ENV === 'production' ? chalk.yellow(env.NODE_ENV) : chalk.green(env.NODE_ENV)}`,
      );
      console.log(`  ${label('Port')}  ${chalk.white(String(env.PORT))}`);
      console.log(`  ${label('Database')}  ${chalk.dim(env.DATABASE_URL)}`);
      console.log(`  ${label('CORS')}  ${chalk.dim(env.CORS_ORIGIN)}`);

      console.log();
    });
}
