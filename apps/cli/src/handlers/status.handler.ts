import fs from 'node:fs';
import chalk from 'chalk';
import { IprepPaths } from '@iprep/shared';
import { checkHealth, checkDbHealth } from '../services/server-manager.js';
import { log } from '../utils/chalk-helper.js';
import { env } from '../config/env.js';

function formatDatabasePath(databaseUrl: string): string {
  return databaseUrl.startsWith('file:') ? databaseUrl.replace('file:', '') : databaseUrl;
}

export async function runStatus(): Promise<void> {
  console.log(log.bold('\niPrep System Status\n'));

  const [serverUp, dbUp] = await Promise.all([checkHealth(), checkDbHealth()]);

  const dbPath = formatDatabasePath(env.DATABASE_URL);
  const configExists = fs.existsSync(IprepPaths.envFilePath);
  const databaseFileExists = fs.existsSync(dbPath);

  const label = (value: string) => chalk.dim(value.padEnd(10));
  const indent = ' '.repeat(14);

  console.log(
    `  ${label('Server')}  ${serverUp ? log.success('Running') : log.error('Not running - run: iprep start')}`,
  );
  console.log(`  ${label('API Base')}  ${chalk.cyan(env.API_BASE_URL)}`);

  console.log();

  console.log(
    `  ${label('Config')}  ${configExists ? log.success('Found') : log.error('Missing - run: iprep onboard')}`,
  );
  console.log(
    `  ${label('Mode')}  ${env.NODE_ENV === 'production' ? chalk.yellow(env.NODE_ENV) : chalk.green(env.NODE_ENV)}`,
  );
  console.log(`  ${label('Port')}  ${chalk.white(String(env.PORT))}`);
  console.log(
    `  ${label('Database')}  ${dbUp ? log.success('Ready') : log.error('Not ready - run: iprep onboard')}`,
  );
  console.log(`${indent}${databaseFileExists ? chalk.dim(dbPath) : log.warn(`${dbPath} missing`)}`);
  console.log(`  ${label('Frontend')}  ${chalk.cyan(env.CORS_ORIGIN)}`);

  console.log();
}
