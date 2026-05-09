import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export type EnvVars = z.infer<typeof EnvSchema>;
