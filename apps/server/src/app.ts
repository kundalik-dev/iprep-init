import express, { Express } from 'express';
import { apiRoutes } from './routes/index.js';
import { randomId } from '@iprep/shared';

const app: Express = express();

app.use(express.json());
app.use('/api/v1', apiRoutes);

console.log(`Random id is ${randomId()}`);

export default app;
