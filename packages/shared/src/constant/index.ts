import dotenv from 'dotenv';
import { IprepPaths } from '../utils/iprep-path.js';

dotenv.config({ path: IprepPaths.envFile });

export const APP_NAME = 'iPrep';
export const APP_VERSION = '0.1.0';
export const API_BASE_URL = 'https://api.myapp.com';

export const ENV_VARS = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  DATABASE_URL: process.env.DATABASE_URL || IprepPaths.dbFile,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
