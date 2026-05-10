import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';

const iprepGradient = gradient(['#6366f1', '#8b5cf6', '#a855f7', '#d946ef']);

export const log = {
  success:   (msg: string) => chalk.green(`✓  ${msg}`),
  error:     (msg: string) => chalk.red(`✗  ${msg}`),
  info:      (msg: string) => chalk.cyan(`ℹ  ${msg}`),
  warn:      (msg: string) => chalk.yellow(`⚠  ${msg}`),
  title:     (msg: string) => chalk.bold.white(`\n${msg}\n`),
  dim:       (msg: string) => chalk.dim(msg),
  bold:      (msg: string) => chalk.bold.white(msg),
  highlight: (msg: string) => iprepGradient(msg),
};

export function printBanner(): void {
  const ascii = figlet.textSync('iPrep', { font: 'Standard' });
  console.log(iprepGradient.multiline(ascii));
  console.log(chalk.dim('  Interview Preparation Platform\n'));
}
