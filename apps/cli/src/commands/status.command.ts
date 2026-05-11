import { Command } from 'commander';
import chalk from 'chalk';
import { checkHealth, checkDbHealth } from '../services/server-manager.js';
import { log } from '../utils/chalk-helper.js';
import { env } from '../config/env.js';

export function register(program: Command): void {
  program
    .command('status')
    .description('Check server health and environment status')
    .action(async () => {
      console.log(log.bold('\niPrep System Status\n'));

      const [serverUp, dbUp] = await Promise.all([checkHealth(), checkDbHealth()]);

      const label = (s: string) => chalk.dim(s.padEnd(10));
      const indent = ' '.repeat(14);

      console.log(
        `  ${label('Server')}  ${serverUp ? log.success('Running') : log.error('Not running — run: iprep start')}`,
      );
      console.log(`  ${label('API Base')}  ${chalk.cyan(env.API_BASE_URL)}`);

      console.log();

      console.log(
        `  ${label('Mode')}  ${env.NODE_ENV === 'production' ? chalk.yellow(env.NODE_ENV) : chalk.green(env.NODE_ENV)}`,
      );
      console.log(`  ${label('Port')}  ${chalk.white(String(env.PORT))}`);
      console.log(
        `  ${label('Database')}  ${dbUp ? log.success('Running') : log.error('Not running — run: iprep onboard')}`,
      );
      console.log(`${indent}${chalk.dim(env.DATABASE_URL.replace('file:', ''))}`);
      console.log(`  ${label('Frontend')}  ${chalk.cyan(env.CORS_ORIGIN)}`);

      console.log();
    });
}
