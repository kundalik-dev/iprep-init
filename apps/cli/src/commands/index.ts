import { Command } from 'commander';
import { register as registerOnboard } from './onboard.command.js';
import { register as registerStatus } from './status.command.js';
import { register as registerStart } from './start.command.js';

export function registerCommands(program: Command): void {
  registerOnboard(program);
  registerStatus(program);
  registerStart(program);
}
