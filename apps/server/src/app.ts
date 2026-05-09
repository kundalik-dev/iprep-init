import express, { Express } from 'express';
import { apiRoutes } from './routes/index.js';

const app: Express = express();

app.use('/api/v1', apiRoutes);

export default app;
