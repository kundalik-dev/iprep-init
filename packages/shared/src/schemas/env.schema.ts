import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  API_BASE_URL: z.string().min(1),
  PROVIDER_KEY_SECRET: z.string().min(32).optional(),
});

export type EnvVars = z.infer<typeof EnvSchema>;
