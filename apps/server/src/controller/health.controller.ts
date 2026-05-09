import { Request, Response } from 'express';
import { uptime } from 'node:process';

export const healthCheck = (req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: 'API is running', uptime: uptime(), timestamp: new Date().toISOString() });
};
