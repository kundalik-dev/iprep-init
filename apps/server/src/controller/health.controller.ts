import { Request, Response } from 'express';
import { uptime } from 'node:process';
import { checkDbHealth } from '@iprep/db';
import { env } from '../config/env.js';
import { ApiResponse, StatusCodes } from '../utils/index.js';

export const healthCheck = async (req: Request, res: Response) => {
  const dbUp = await checkDbHealth();

  console.log(`DB up is ${dbUp}`);

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
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
      },
      'Health check completed',
    ),
  );
};
