/**
 * ai-adapter.ts
 *
 * Routes a chat prompt to the correct AI backend based on user preferences:
 *   - mode: 'CLI'     → spawn the provider's CLI process
 *   - mode: 'API_KEY' → call the provider's REST API with the stored key
 *
 * Called by the conversation controller for every user message.
 */

import { spawn } from 'node:child_process';
import { SettingsQuery } from '@iprep/db';
import { decryptProviderSecret } from './providerSecrets.js';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AiPrefs {
  aiMode?: 'CLI' | 'API_KEY'; // preferred connection mode
  aiProvider?: string; // e.g. 'CLAUDE' | 'GEMINI' | 'CODEX' | 'OLLAMA'
  aiModel?: string; // optional model override
}

export interface AiAdapterResult {
  content: string;
  provider: string;
  model: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Run a CLI command and return its stdout as a string. */
function runCli(command: string, args: string[], input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    const proc = spawn(command, args, {
      shell: isWin ? 'cmd.exe' : '/bin/sh',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d: Buffer) => {
      stdout += d.toString();
    });
    proc.stderr.on('data', (d: Buffer) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || `CLI exited with code ${code}`));
    });

    proc.on('error', reject);

    // Write the prompt to stdin and close
    proc.stdin.write(input);
    proc.stdin.end();
  });
}

// ── CLI adapters ───────────────────────────────────────────────────────────────

async function callViaCli(
  provider: string,
  model: string | null,
  prompt: string,
): Promise<AiAdapterResult> {
  const isWin = process.platform === 'win32';

  switch (provider) {
    case 'CLAUDE': {
      const cmd = isWin ? 'claude.cmd' : 'claude';
      const args = ['--print', '--output-format', 'text'];
      if (model) args.push('--model', model);
      args.push('-p', prompt);
      const content = await runCli(cmd, args, '').catch(() => runCli('claude', args, ''));
      return { content, provider, model };
    }

    case 'GEMINI': {
      const cmd = isWin ? 'gemini.cmd' : 'gemini';
      // Gemini CLI: `gemini -p "<prompt>"`
      const args = ['-p', prompt];
      if (model) args.push('--model', model);
      const content = await runCli(cmd, args, '');
      return { content, provider, model };
    }

    case 'CODEX': {
      const cmd = isWin ? 'codex.cmd' : 'codex';
      // Codex CLI: `codex --quiet "<prompt>"`
      const args = ['--quiet', prompt];
      if (model) args.push('--model', model);
      const content = await runCli(cmd, args, '');
      return { content, provider, model };
    }

    case 'OLLAMA': {
      // Ollama REST API is always local; treat as a special case even in CLI mode
      const ollamaModel = model ?? 'llama3';
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: ollamaModel, prompt, stream: false }),
      });
      if (!response.ok) throw new Error(`Ollama error ${response.status}`);
      const json = (await response.json()) as { response: string };
      return { content: json.response, provider, model: ollamaModel };
    }

    default:
      throw new Error(`CLI mode is not supported for provider "${provider}"`);
  }
}

// ── API key adapters ───────────────────────────────────────────────────────────

async function callViaApiKey(
  provider: string,
  model: string | null,
  apiKey: string,
  prompt: string,
): Promise<AiAdapterResult> {
  switch (provider) {
    case 'CLAUDE': {
      const m = model ?? 'claude-3-5-haiku-20241022';
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: m,
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(`Anthropic API error ${r.status}: ${err}`);
      }
      const json = (await r.json()) as { content: Array<{ text: string }> };
      return { content: json.content[0]?.text ?? '', provider, model: m };
    }

    case 'GEMINI': {
      const m = model ?? 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(`Gemini API error ${r.status}: ${err}`);
      }
      const json = (await r.json()) as {
        candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
      };
      return { content: json.candidates[0]?.content?.parts[0]?.text ?? '', provider, model: m };
    }

    case 'CODEX': {
      const m = model ?? 'gpt-4o-mini';
      const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: m,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(`OpenAI API error ${r.status}: ${err}`);
      }
      const json = (await r.json()) as { choices: Array<{ message: { content: string } }> };
      return { content: json.choices[0]?.message?.content ?? '', provider, model: m };
    }

    case 'OLLAMA': {
      // Ollama doesn't need an API key; same as CLI path
      const m = model ?? 'llama3';
      const r = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: m, prompt, stream: false }),
      });
      if (!r.ok) throw new Error(`Ollama error ${r.status}`);
      const json = (await r.json()) as { response: string };
      return { content: json.response, provider, model: m };
    }

    default:
      throw new Error(`API key mode is not supported for provider "${provider}"`);
  }
}

// ── Main entry point ───────────────────────────────────────────────────────────

/**
 * Call the AI for a given prompt using the user's saved preferences.
 *
 * Falls back to a mock response if:
 *  - No AI preference is configured
 *  - The configured provider/credential is unavailable
 */
export async function callAi(userId: string, prompt: string): Promise<AiAdapterResult> {
  const FALLBACK: AiAdapterResult = {
    content: `[iPrep AI] No AI provider is configured yet. Go to Settings → Preferences to choose a provider and mode, then add your API key (or install the CLI) in Settings → API Keys.`,
    provider: 'none',
    model: null,
  };

  // 1. Load user preferences
  let rawPrefs: Record<string, unknown> = {};
  try {
    rawPrefs = ((await SettingsQuery.getPreferences(userId)) as Record<string, unknown>) ?? {};
  } catch {
    return FALLBACK;
  }

  const aiMode = (rawPrefs.aiMode as string | undefined)?.toUpperCase() as
    | 'CLI'
    | 'API_KEY'
    | undefined;
  const aiProvider = (rawPrefs.aiProvider as string | undefined)?.toUpperCase();
  // Normalize model name: trim whitespace and lowercase so users can type "GPT-4o" etc.
  const rawModel = (rawPrefs.aiModel as string | undefined)?.trim();
  const aiModel = rawModel ? rawModel.toLowerCase() : null;

  if (!aiMode || !aiProvider) return FALLBACK;

  // 2. CLI mode — no credential needed
  if (aiMode === 'CLI') {
    try {
      return await callViaCli(aiProvider, aiModel, prompt);
    } catch (err) {
      return {
        content: `[iPrep AI — CLI error] ${(err as Error).message}`,
        provider: aiProvider,
        model: aiModel,
      };
    }
  }

  // 3. API_KEY mode — look up stored credential
  const providers = await SettingsQuery.getProviders(userId).catch(() => []);
  const credential = providers.find(
    (p) => p.provider === aiProvider && p.mode === 'API_KEY' && p.hasApiKey,
  );

  if (!credential) {
    return {
      content: `[iPrep AI] No API key found for provider "${aiProvider}". Please add it in Settings → API Keys.`,
      provider: aiProvider,
      model: aiModel,
    };
  }

  // Decrypt the key
  let apiKey: string;
  try {
    apiKey = decryptProviderSecret({
      ciphertext: credential.apiKeyCiphertext!,
      iv: credential.apiKeyIv!,
      authTag: credential.apiKeyAuthTag!,
    });
  } catch {
    return {
      content: `[iPrep AI] Could not decrypt the stored API key for "${aiProvider}". Please re-save it in Settings → API Keys.`,
      provider: aiProvider,
      model: aiModel,
    };
  }

  try {
    return await callViaApiKey(aiProvider, aiModel, apiKey, prompt);
  } catch (err) {
    return {
      content: `[iPrep AI — API error] ${(err as Error).message}`,
      provider: aiProvider,
      model: aiModel,
    };
  }
}
