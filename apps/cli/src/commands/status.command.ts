import { Command } from 'commander';
import { runStatus } from '../handlers/status.handler.js';

export function register(program: Command): void {
  program
    .command('status')
    .description('Check server health and environment status')
    .option('--json', 'Output status in JSON format')
    .action(async (opts: { json?: boolean }) => {
      await runStatus(opts);
    });
}
