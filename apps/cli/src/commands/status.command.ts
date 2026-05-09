import { Command } from 'commander';
import { checkHealth } from '../services/server-manager.js';
import { log } from '../utils/chalk-helper.js';

export function register(program: Command): void {
  program
    .command('status')
    .description('Check server health and environment status')
    .option('-p, --port <number>', 'Port to check', '3000')
    .action(async (opts: { port: string }) => {
      console.log(log.bold('\niPrep System Status\n'));

      const serverUp = await checkHealth();

      console.log(
        `  Server + UI  ${serverUp ? log.success('Running on http://localhost:3000') : log.error('Not running — run: iprep start')}`,
      );
    });
}
