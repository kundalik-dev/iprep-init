import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';

const iprepGradient = gradient(['#6366f1', '#8b5cf6', '#a855f7', '#d946ef']);

export const log = {
  success: (msg: string) => console.log(chalk.green(`✓  ${msg}`)),
  error: (msg: string) => console.error(chalk.red(`✗  ${msg}`)),
  info: (msg: string) => console.log(chalk.cyan(`ℹ  ${msg}`)),
  warn: (msg: string) => console.warn(chalk.yellow(`⚠  ${msg}`)),
  title: (msg: string) => console.log(chalk.bold.white(`\n${msg}\n`)),
  dim: (msg: string) => console.log(chalk.dim(msg)),
  bold: (msg: string) => console.log(chalk.bold.white(msg)),
  highlight: (msg: string) => iprepGradient(msg),
};

export function printBanner(): void {
  const ascii = figlet.textSync('iPrep', { font: 'Standard' });
  console.log(iprepGradient.multiline(ascii));
  console.log(chalk.dim('  Interview Preparation Platform\n'));
}
