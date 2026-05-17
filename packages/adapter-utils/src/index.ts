export type AdapterLogStream = 'stdout' | 'stderr';

export interface AdapterModel {
  id: string;
  label: string;
}

export interface AdapterSessionParams {
  sessionId?: string;
  cwd?: string;
  [key: string]: unknown;
}

export interface AdapterExecutionContext {
  runId: string;
  prompt: string;
  config: Record<string, unknown>;
  sessionParams?: AdapterSessionParams | null;
  onLog?: (stream: AdapterLogStream, chunk: string) => void | Promise<void>;
}

export interface AdapterExecutionResult {
  content: string;
  provider: string;
  model: string | null;
  sessionParams?: AdapterSessionParams | null;
  rawStdout?: string;
  rawStderr?: string;
  exitCode: number | null;
  timedOut: boolean;
  errorMessage?: string | null;
}

export interface AdapterEnvironmentTestContext {
  adapterType: string;
  config: Record<string, unknown>;
}

export interface AdapterEnvironmentCheck {
  level: 'info' | 'warn' | 'error';
  message: string;
  code: string;
  hint?: string;
}

export interface AdapterEnvironmentTestResult {
  adapterType: string;
  status: 'pass' | 'warn' | 'fail';
  checks: AdapterEnvironmentCheck[];
  testedAt: string;
}

export interface ServerAdapterModule {
  type: string;
  label: string;
  models: AdapterModel[];
  execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult>;
  testEnvironment(ctx: AdapterEnvironmentTestContext): Promise<AdapterEnvironmentTestResult>;
}

export {
  asBoolean,
  asNumber,
  asString,
  ensureAbsoluteDirectory,
  parseRecord,
  runChildProcess,
  type ChildProcessResult,
} from './server-utils.js';
