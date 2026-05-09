import { z } from 'zod';
import { ENV_VARS } from '../constant/index.js';

export const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(ENV_VARS.PORT),
  DATABASE_URL: z.string().min(1).default(ENV_VARS.DATABASE_URL),
  CORS_ORIGIN: z.string().default(ENV_VARS.CORS_ORIGIN),
  NODE_ENV: z.enum(['development', 'production', 'test']).default(ENV_VARS.NODE_ENV),
});
