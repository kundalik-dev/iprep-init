import { Command } from 'commander';
import { checkHealth } from '../services/server-manager.js';

export function register(program: Command): void {
  program
    .command('status')
    .description('Check server health and environment status')
    .option('-p, --port <number>', 'Port to check', '3000')
    .action(async (opts: { port: string }) => {
      // console.log(bold('\niPrep System Status\n'));

      const serverUp = await checkHealth();
      // console.log(
      //   `  Server + UI  ${serverUp ? success('Running on http://localhost:3000') : error('Not running — run: iprep start')}`,
      // );
    });
}
