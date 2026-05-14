import { Command } from 'commander';
import { runStart } from '../handlers/start.handler.js';

export function register(program: Command): void {
  program
    .command('start')
    .description('Start the iPrep Express server')
    .option('-p, --port <number>', 'Override the default server port')
    .option('--no-open', 'Do not open the browser automatically')
    .action(async (opts: { port?: string; open?: boolean }) => {
      await runStart(opts);
    });
}
