import { ENV_VARS, EnvSchema } from '@iprep/shared';

const parsed = EnvSchema.safeParse(process.env);

console.log(`Server is running on port ${ENV_VARS.PORT} in ${ENV_VARS.NODE_ENV} mode.`);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = Object.freeze(parsed.data);
export type Env = typeof env;
