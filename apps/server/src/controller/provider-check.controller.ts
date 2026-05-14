import type { Request, Response, RequestHandler } from 'express';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';
import { decryptProviderSecret } from '../utils/providerSecrets.js';
import { SettingsQuery } from '@iprep/db';

const LOCAL_USER = 'local_user';
function userId(req: Request): string {
  return (req.headers['x-user-id'] as string) || LOCAL_USER;
}

// ── CLI definitions ──────────────────────────────────────────────────────────
const CLI_CATALOG: Record<
  string,
  {
    label: string;
    command: string;
    winCommand: string;
    installNpm: string;
    installWin: string;
    installMac: string;
  }
> = {
  claude: {
    label: 'Claude (Anthropic)',
    command: 'claude',
    winCommand: 'claude.cmd',
    installNpm: 'npm install -g @anthropic-ai/claude-code',
    installWin: 'npm install -g @anthropic-ai/claude-code',
    installMac: 'npm install -g @anthropic-ai/claude-code',
  },
  gemini: {
    label: 'Gemini CLI (Google)',
    command: 'gemini',
    winCommand: 'gemini.cmd',
    installNpm: 'npm install -g @google/gemini-cli',
    installWin: 'npm install -g @google/gemini-cli',
    installMac: 'npm install -g @google/gemini-cli',
  },
  codex: {
    label: 'Codex CLI (OpenAI)',
    command: 'codex',
    winCommand: 'codex.cmd',
    installNpm: 'npm install -g @openai/codex',
    installWin: 'npm install -g @openai/codex',
    installMac: 'npm install -g @openai/codex',
  },
  ollama: {
    label: 'Ollama (Local AI)',
    command: 'ollama',
    winCommand: 'ollama.exe',
    installNpm: '',
    installWin: 'winget install Ollama.Ollama',
    installMac: 'brew install ollama',
  },
};

async function checkCli(command: string): Promise<{ installed: boolean; version: string | null }> {
  const isWindows = process.platform === 'win32';

  // Use the shell so npm global .cmd wrappers (Windows) and PATH aliases (macOS) are resolved
  const { exec } = await import('node:child_process');
  const execSh = (cmd: string): Promise<string> =>
    new Promise((resolve, reject) => {
      exec(
        cmd,
        { shell: isWindows ? 'cmd.exe' : '/bin/sh', timeout: 5000 },
        (err, stdout, stderr) => {
          if (err) reject(err);
          else resolve(stdout.trim());
        },
      );
    });

  // First confirm the binary exists
  const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
  const path = await execSh(checkCmd).catch(() => '');
  if (!path) return { installed: false, version: null };

  // Try to get version (many CLIs: --version, some: -v, version)
  const version = await execSh(`${command} --version`)
    .then((v) => v.split('\n')[0]?.trim() ?? null)
    .catch(() =>
      execSh(`${command} -v`)
        .then((v) => v.split('\n')[0]?.trim() ?? null)
        .catch(() => null),
    );

  return { installed: true, version };
}

// ── GET /api/v1/settings/providers/cli-status ─────────────────────────────────
export const getCliStatus: RequestHandler = asyncHandler(async (_req: Request, res: Response) => {
  const checks = await Promise.all(
    Object.entries(CLI_CATALOG).map(async ([key, def]) => {
      const { installed, version } = await checkCli(def.command);
      return {
        key,
        label: def.label,
        installed,
        version,
        installNpm: def.installNpm,
        installWin: def.installWin,
        installMac: def.installMac,
      };
    }),
  );

  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, checks, 'CLI status fetched'));
});

// ── POST /api/v1/settings/providers/:id/test ──────────────────────────────────
export const testProvider: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const credentialId = req.params.id as string;

  const providers = await SettingsQuery.getProviders(uid);
  const credential = providers.find((p) => p.id === credentialId);

  if (!credential) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider credential not found');

  if (!credential.apiKeyCiphertext || !credential.apiKeyIv || !credential.apiKeyAuthTag) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No encrypted key stored for this credential');
  }

  let apiKey: string;
  try {
    apiKey = decryptProviderSecret({
      ciphertext: credential.apiKeyCiphertext,
      iv: credential.apiKeyIv,
      authTag: credential.apiKeyAuthTag,
    });
  } catch {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to decrypt API key');
  }

  // ── Run provider-specific health checks ──────────────────────────────────────
  let passed = false;
  let message = '';

  try {
    switch (credential.provider) {
      case 'CLAUDE': {
        const r = await fetch('https://api.anthropic.com/v1/models', {
          headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        });
        passed = r.ok;
        message = r.ok
          ? 'API key valid — Anthropic responded OK'
          : `Anthropic returned ${r.status}`;
        break;
      }
      case 'GEMINI': {
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
        );
        passed = r.ok;
        message = r.ok ? 'API key valid — Gemini responded OK' : `Gemini returned ${r.status}`;
        break;
      }
      case 'CODEX': {
        const r = await fetch('https://api.openai.com/v1/models', {
          headers: { Authorization: `Bearer ${apiKey}` },
        });
        passed = r.ok;
        message = r.ok ? 'API key valid — OpenAI responded OK' : `OpenAI returned ${r.status}`;
        break;
      }
      case 'OTHER': {
        // Deepgram projects endpoint
        const r = await fetch('https://api.deepgram.com/v1/projects', {
          headers: { Authorization: `Token ${apiKey}` },
        });
        passed = r.ok;
        message = r.ok ? 'API key valid — Deepgram responded OK' : `Deepgram returned ${r.status}`;
        break;
      }
      case 'OLLAMA': {
        // Ollama runs locally
        const r = await fetch('http://localhost:11434/api/tags').catch(() => null);
        passed = r !== null && r.ok;
        message = passed ? 'Ollama is running locally' : 'Ollama is not running on port 11434';
        break;
      }
      default:
        message = `No test available for provider "${credential.provider}"`;
    }
  } catch (err: unknown) {
    message = `Connection error: ${(err as Error).message}`;
  }

  // Update the test result in DB
  await SettingsQuery.markProviderTestResult(
    credentialId as string,
    uid as string,
    passed,
    message,
  );

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        { passed, message, provider: credential.provider },
        'Provider test complete',
      ),
    );
});
