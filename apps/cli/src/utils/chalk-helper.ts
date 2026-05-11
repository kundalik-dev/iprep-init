import chalk from 'chalk';
import figlet from 'figlet';
import gradient from 'gradient-string';

const iprepGradient = gradient(['#6366f1', '#8b5cf6', '#a855f7', '#d946ef']);

export const log = {
  success: (msg: string) => chalk.green(`✓  ${msg}`),
  error: (msg: string) => chalk.red(`✗  ${msg}`),
  info: (msg: string) => chalk.cyan(`ℹ  ${msg}`),
  warn: (msg: string) => chalk.yellow(`⚠  ${msg}`),
  title: (msg: string) => chalk.bold.white(`\n${msg}\n`),
  dim: (msg: string) => chalk.dim(msg),
  bold: (msg: string) => chalk.bold.white(msg),
  highlight: (msg: string) => iprepGradient(msg),
};

export function printBanner(): void {
  const ascii = figlet.textSync('iPrep', { font: 'ANSI Shadow' });
  console.log(iprepGradient.multiline(ascii));
  console.log(chalk.dim('  Interview Preparation Platform'));
}

export function printSeparator(): void {
  console.log(iprepGradient('  ' + '─'.repeat(52)));
  console.log();
}

export function printCommandBadge(command: string): void {
  console.log(`  ${chalk.bgHex('#312e81').hex('#a5b4fc')(` ${command} `)}`);
  console.log();
}

export function printMeta(parts: string[]): void {
  console.log(`  ${chalk.dim(parts.join('  |  '))}`);
  console.log();
}

export function printStep(title: string, value?: string): void {
  console.log(`  ${chalk.green('o')}  ${chalk.bold.white(title)}`);
  if (value) {
    console.log(`  ${chalk.dim('|')}  ${chalk.dim(value)}`);
  }
  console.log(`  ${chalk.dim('|')}`);
}
