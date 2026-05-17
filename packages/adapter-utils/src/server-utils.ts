import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

export interface ChildProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  timedOut: boolean;
}

export function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return fallback;
}

export function parseRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export async function ensureAbsoluteDirectory(dir: string): Promise<void> {
  if (!path.isAbsolute(dir)) {
    throw new Error(`Working directory must be absolute: ${dir}`);
  }
  await fs.mkdir(dir, { recursive: true });
}

export function runChildProcess(
  command: string,
  options: {
    args?: string[];
    cwd?: string;
    env?: Record<string, string>;
    stdin?: string;
    timeoutMs?: number;
    onStdout?: (chunk: string) => void | Promise<void>;
    onStderr?: (chunk: string) => void | Promise<void>;
  } = {},
): Promise<ChildProcessResult> {
  return new Promise((resolve, reject) => {
    const args = options.args ?? [];
    const proc = spawn(command, args, {
      cwd: options.cwd,
      env: { ...process.env, ...options.env },
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;
    let timer: NodeJS.Timeout | null = null;

    if (options.timeoutMs && options.timeoutMs > 0) {
      timer = setTimeout(() => {
        timedOut = true;
        proc.kill('SIGTERM');
      }, options.timeoutMs);
    }

    proc.stdout.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stdout += text;
      void options.onStdout?.(text);
    });

    proc.stderr.on('data', (chunk: Buffer) => {
      const text = chunk.toString();
      stderr += text;
      void options.onStderr?.(text);
    });

    proc.on('error', reject);
    proc.on('close', (exitCode, signal) => {
      if (timer) clearTimeout(timer);
      resolve({ stdout, stderr, exitCode, signal, timedOut });
    });

    proc.stdin.write(options.stdin ?? '');
    proc.stdin.end();
  });
}
