import cors from 'cors';
import express, { Express } from 'express';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { randomId } from '@iprep/shared';
import { errorHandler } from './utils/index.js';

const app: Express = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json());
app.use('/api/v1', apiRoutes);
app.use(errorHandler);

console.log(`Random id is ${randomId()}`);

export default app;
