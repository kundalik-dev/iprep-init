import type { Request, Response } from 'express';
import type { AIProvider, ProviderMode } from '@iprep/db';
import { SettingsQuery } from '@iprep/db';
import { encryptProviderSecret, hashProviderSecret } from '../utils/providerSecrets.js';
import { decryptProviderSecret } from '../utils/providerSecrets.js';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';

const LOCAL_USER = 'local_user';

// ── Helpers ──────────────────────────────────────────────────────────────────

function userId(req: Request): string {
  return (req.headers['x-user-id'] as string) || LOCAL_USER;
}

const VALID_PROVIDERS = new Set(['CLAUDE', 'CODEX', 'GEMINI', 'OPENROUTER', 'OLLAMA', 'OTHER']);
const VALID_MODES = new Set(['CLI', 'API_KEY']);

function validateProviderInput(provider: string, mode: string): void {
  if (!VALID_PROVIDERS.has(provider)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid provider "${provider}". Valid values: ${[...VALID_PROVIDERS].join(', ')}`,
    );
  }
  if (!VALID_MODES.has(mode)) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Invalid mode "${mode}". Valid values: ${[...VALID_MODES].join(', ')}`,
    );
  }
}

// ── Preferences ───────────────────────────────────────────────────────────────

export const getPreferences = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const preferences = await SettingsQuery.getPreferences(uid);
  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, preferences ?? {}, 'Preferences fetched'));
});

export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const updated = await SettingsQuery.updatePreferences(uid, req.body);
  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, updated.preferences, 'Preferences saved'));
});

// ── Providers list ─────────────────────────────────────────────────────────────

export const getProviders = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const providers = await SettingsQuery.getProviders(uid);

  // Strip all encrypted/sensitive fields before sending to frontend
  const safe = providers.map((p) => ({
    id: p.id,
    provider: p.provider,
    mode: p.mode,
    modelName: p.modelName,
    hasApiKey: p.hasApiKey,
    isSelected: p.isSelected,
    isWorking: p.isWorking,
    lastTestPassed: p.lastTestPassed,
    lastTestMessage: p.lastTestMessage,
    lastTestedAt: p.lastTestedAt,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, safe, 'Providers fetched'));
});

// ── Save / upsert API key ─────────────────────────────────────────────────────

export const saveApiKey = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const { provider, mode = 'API_KEY', apiKey, modelName } = req.body as {
    provider: string;
    mode?: string;
    apiKey: string;
    modelName?: string;
  };

  if (!provider) throw new ApiError(StatusCodes.BAD_REQUEST, 'provider is required');
  if (!apiKey) throw new ApiError(StatusCodes.BAD_REQUEST, 'apiKey is required');

  validateProviderInput(provider.toUpperCase(), mode.toUpperCase());

  const normalizedProvider = provider.toUpperCase() as AIProvider;
  const normalizedMode = mode.toUpperCase() as ProviderMode;

  // Encrypt with AES-256-GCM and also hash for equality checks
  const { ciphertext, iv, authTag } = encryptProviderSecret(apiKey);
  const apiKeyHash = await hashProviderSecret(apiKey);

  const result = await SettingsQuery.upsertProvider(uid, {
    provider: normalizedProvider,
    mode: normalizedMode,
    modelName: modelName ?? null,
    hasApiKey: true,
    apiKeyHash,
    apiKeyCiphertext: ciphertext,
    apiKeyIv: iv,
    apiKeyAuthTag: authTag,
  });

  res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, {
      id: result.id,
      provider: result.provider,
      mode: result.mode,
      hasApiKey: true,
      isWorking: result.isWorking,
    }, 'API key saved successfully'),
  );
});

// ── Delete provider credential ────────────────────────────────────────────────

export const deleteProviderKey = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const credentialId = req.params.id;

  if (!credentialId) throw new ApiError(StatusCodes.BAD_REQUEST, 'id param is required');

  await SettingsQuery.deleteProvider(credentialId, uid);
  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { id: credentialId }, 'Provider key deleted'));
});

// ── Decrypt key (internal / admin use only) ────────────────────────────────────

export const revealApiKey = asyncHandler(async (req: Request, res: Response) => {
  const uid = userId(req);
  const credentialId = req.params.id;

  const providers = await SettingsQuery.getProviders(uid);
  const credential = providers.find((p) => p.id === credentialId);

  if (!credential) throw new ApiError(StatusCodes.NOT_FOUND, 'Provider credential not found');

  if (!credential.apiKeyCiphertext || !credential.apiKeyIv || !credential.apiKeyAuthTag) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'No encrypted key stored for this credential');
  }

  const plaintext = decryptProviderSecret({
    ciphertext: credential.apiKeyCiphertext,
    iv: credential.apiKeyIv,
    authTag: credential.apiKeyAuthTag,
  });

  res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, { apiKey: plaintext }, 'Key decrypted'));
});
