import dotenv from 'dotenv';
import { IprepPaths } from '../utils/iprep-path.js';
import { EnvSchema, type EnvVars } from '../schemas/env.schema.js';

export const APP_NAME = 'iPrep';
export const APP_VERSION = '0.1.0';
export const API_BASE_URL = 'https://api.myapp.com';

const DEFAULTS: EnvVars = {
  PORT: 3000,
  NODE_ENV: 'development',
  DATABASE_URL: IprepPaths.dbFile,
  CORS_ORIGIN: 'http://localhost:5173',
};

function loadEnv(): EnvVars {
  if (!IprepPaths.isEnvExists) {
    return DEFAULTS;
  }

  dotenv.config({ path: IprepPaths.envFilePath });

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
