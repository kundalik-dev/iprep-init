import { Request, Response } from 'express';
import { uptime } from 'node:process';
import { env } from '../config/env.js';

export const healthCheck = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'running',
    uptime: uptime(),
    timestamp: new Date().toISOString(),
    server: {
      url: env.API_BASE_URL,
      port: env.PORT,
    },
    environment: {
      mode: env.NODE_ENV,
      database: env.DATABASE_URL,
      cors: env.CORS_ORIGIN,
    },
  });
};
