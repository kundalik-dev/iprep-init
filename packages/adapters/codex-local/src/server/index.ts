import type { ServerAdapterModule } from '@iprep/adapter-utils';
import { label, models, type } from '../index.js';
import { execute } from './execute.js';
import { testEnvironment } from './test.js';

export function createServerAdapter(): ServerAdapterModule {
  return {
    type,
    label,
    models,
    execute,
    testEnvironment,
  };
}
