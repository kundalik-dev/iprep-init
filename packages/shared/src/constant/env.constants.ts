import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { IprepPaths } from '../utils/iprep-path.js';
import { EnvSchema, type EnvVars } from '../schemas/env.schema.js';

export const APP_NAME = 'iPrep';
export const APP_VERSION = '1.2.2';

const DEFAULTS: EnvVars = {
  PORT: 5545,
  NODE_ENV: 'production',
  DATABASE_URL: IprepPaths.dbFile,
  CORS_ORIGIN: 'http://localhost:5173',
  API_BASE_URL: 'http://localhost:5545/api/v1',
};

function resolveEnvPath(): string | null {
  if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
    // Dev: load from monorepo/project root
    const devPath = path.join(process.cwd(), '.env');
    return fs.existsSync(devPath) ? devPath : null;
  }
  // Production (published install): load from ~/.iprep/.env
  return IprepPaths.isEnvExists ? IprepPaths.envFilePath : null;
}

function loadEnv(): EnvVars {
  const envPath = resolveEnvPath();

  if (!envPath) return DEFAULTS;

  dotenv.config({ path: envPath });

  const result = EnvSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  - ${String(i.path[0])}: ${i.message}`)
      .join('\n');
    console.error(`[iPrep] .env file is missing required fields:\n${errors}`);
    process.exit(1);
  }

  return result.data;
}

export const ENV_VARS: EnvVars = loadEnv();
