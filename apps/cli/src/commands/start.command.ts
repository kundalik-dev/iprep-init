import { Command } from 'commander';
import { runStart } from '../handlers/start.handler.js';

export function register(program: Command): void {
  program
    .command('start')
    .description('Start the iPrep Express server')
    .action(async (opts: Record<string, unknown>) => {
      await runStart(opts);
    });
}
