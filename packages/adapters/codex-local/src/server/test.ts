import {
  asString,
  runChildProcess,
  type AdapterEnvironmentCheck,
  type AdapterEnvironmentTestContext,
  type AdapterEnvironmentTestResult,
} from '@iprep/adapter-utils';

function defaultCommand(): string {
  return process.platform === 'win32' ? 'codex.cmd' : 'codex';
}

export async function testEnvironment(
  ctx: AdapterEnvironmentTestContext,
): Promise<AdapterEnvironmentTestResult> {
  const checks: AdapterEnvironmentCheck[] = [];
  const command = asString(ctx.config.command, defaultCommand());

  try {
    const result = await runChildProcess(command, {
      args: ['--version'],
      timeoutMs: 10_000,
    });

    if (result.exitCode === 0) {
      checks.push({
        level: 'info',
        message: `Codex CLI detected: ${result.stdout.trim() || command}`,
        code: 'codex_cli_detected',
      });
    } else {
      checks.push({
        level: 'error',
        message: result.stderr.trim() || `Codex CLI exited with code ${result.exitCode ?? -1}`,
        code: 'codex_cli_failed',
      });
    }
  } catch (err) {
    checks.push({
      level: 'error',
      message: err instanceof Error ? err.message : String(err),
      hint: 'Install Codex CLI or set adapter config.command to the executable path.',
      code: 'codex_cli_missing',
    });
  }

  return {
    adapterType: ctx.adapterType,
    status: checks.some((check) => check.level === 'error') ? 'fail' : 'pass',
    checks,
    testedAt: new Date().toISOString(),
  };
}
