import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './utils/index.js';

const app: Express = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/api/v1', apiRoutes);

// ── Serve built frontend in production ──────────────────────────────────────
// When published as a CLI the frontend static files sit at dist/frontend/
// relative to the bundled server.js. We resolve the path from the running file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.join(__dirname, 'frontend');

if (env.NODE_ENV === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));

  // SPA fallback — any non-API route returns index.html
  app.get('*', (_req, res, next) => {
    if (_req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
