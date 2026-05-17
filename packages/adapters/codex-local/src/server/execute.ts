import path from 'node:path';
import {
  asNumber,
  asString,
  ensureAbsoluteDirectory,
  parseRecord,
  runChildProcess,
  type AdapterExecutionContext,
  type AdapterExecutionResult,
} from '@iprep/adapter-utils';
import { parseCodexJsonl, isUnknownSessionError } from './parse.js';

function defaultCommand(): string {
  return process.platform === 'win32' ? 'codex.cmd' : 'codex';
}

function buildArgs(config: Record<string, unknown>, sessionId: string | null): string[] {
  const args = ['exec'];
  if (sessionId) args.push('resume', sessionId);
  args.push('--json', '--color', 'never', '--skip-git-repo-check');

  const model = asString(config.model, '').trim();
  if (model) args.push('--model', model);

  args.push('-');
  return args;
}

async function runCodex(
  ctx: AdapterExecutionContext,
  sessionId: string | null,
): Promise<AdapterExecutionResult> {
  const command = asString(ctx.config.command, defaultCommand());
  const cwd = path.resolve(asString(ctx.config.cwd, process.cwd()));
  const timeoutSec = asNumber(ctx.config.timeoutSec, 0);
  const env = parseRecord(ctx.config.env) as Record<string, string>;

  await ensureAbsoluteDirectory(cwd);

  const proc = await runChildProcess(command, {
    args: buildArgs(ctx.config, sessionId),
    cwd,
    env,
    stdin: ctx.prompt,
    timeoutMs: timeoutSec > 0 ? timeoutSec * 1000 : 0,
    onStdout: (chunk) => ctx.onLog?.('stdout', chunk),
    onStderr: (chunk) => ctx.onLog?.('stderr', chunk),
  });

  const parsed = parseCodexJsonl(proc.stdout);
  const resolvedSessionId = parsed.sessionId ?? sessionId;
  const errorMessage =
    proc.exitCode === 0
      ? parsed.errorMessage
      : parsed.errorMessage || proc.stderr.trim() || `Codex exited with code ${proc.exitCode ?? -1}`;

  return {
    content: parsed.content,
    provider: 'CODEX',
    model: asString(ctx.config.model, '') || null,
    sessionParams: resolvedSessionId ? { sessionId: resolvedSessionId, cwd } : null,
    rawStdout: proc.stdout,
    rawStderr: proc.stderr,
    exitCode: proc.exitCode,
    timedOut: proc.timedOut,
    errorMessage,
  };
}

export async function execute(ctx: AdapterExecutionContext): Promise<AdapterExecutionResult> {
  const existingSessionId = asString(ctx.sessionParams?.sessionId, '').trim() || null;
  const first = await runCodex(ctx, existingSessionId);

  if (
    existingSessionId &&
    first.exitCode !== 0 &&
    isUnknownSessionError(first.rawStderr ?? '', first.rawStdout ?? '')
  ) {
    await ctx.onLog?.(
      'stderr',
      `[codex_local] Saved Codex session "${existingSessionId}" is unavailable; retrying with a fresh session.\n`,
    );
    return runCodex(ctx, null);
  }

  return first;
}
