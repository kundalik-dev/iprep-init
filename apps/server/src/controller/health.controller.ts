import { Request, Response } from 'express';
import { uptime } from 'node:process';
import { checkDbHealth } from '@iprep/db';
import { env } from '../config/env.js';

export const healthCheck = async (req: Request, res: Response) => {
  const dbUp = await checkDbHealth();

  res.status(200).json({
    status: 'running',
    uptime: uptime(),
    timestamp: new Date().toISOString(),
    server: {
      apiBase: env.API_BASE_URL,
      port: env.PORT,
    },
    environment: {
      mode: env.NODE_ENV,
      database: {
        status: dbUp ? 'running' : 'not running',
        file: env.DATABASE_URL,
      },
      frontend: env.CORS_ORIGIN,
    },
  });
};
