import { Command } from 'commander';
import { runOnBoard } from '../handlers/onboard.handler.js';

export function register(program: Command): void {
  program
    .command('onboard')
    .description(
      'Creates ~/.iprep/ folder structure and run database migration (run once on first install)',
    )
    .option('-y, --yes', 'Skip confirmation prompt and run automatically')
    .action(async (opts: { yes?: boolean }) => {
      await runOnBoard(opts);
    });
}
