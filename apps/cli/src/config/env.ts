import { ENV_VARS } from '@iprep/shared';

export const env = Object.freeze(ENV_VARS);

export type Env = typeof env;
