import { apiRequest } from '@/lib/http';

export type ProviderData = {
  id: string;
  provider: string;
  mode: string;
  modelName?: string;
  hasApiKey: boolean;
  isWorking: boolean;
  isSelected: boolean;
  lastTestPassed?: boolean | null;
  lastTestedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PreferencesData = Record<string, unknown>;

export type SaveApiKeyPayload = {
  provider: string;
  mode?: string;
  apiKey: string;
  modelName?: string;
};

// ── Preferences ───────────────────────────────────────────────────────────────
export async function getPreferences() {
  return apiRequest<PreferencesData>('/settings/preferences');
}

export async function updatePreferences(preferences: PreferencesData) {
  return apiRequest<PreferencesData>('/settings/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
}

// ── Providers ─────────────────────────────────────────────────────────────────
export async function getProviders() {
  return apiRequest<ProviderData[]>('/settings/providers');
}

// ── API Keys ──────────────────────────────────────────────────────────────────
export async function saveApiKey(payload: SaveApiKeyPayload) {
  return apiRequest<{ id: string; provider: string; hasApiKey: boolean }>('/settings/api-keys', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteProviderKey(id: string) {
  return apiRequest<{ id: string }>(`/settings/api-keys/${id}`, {
    method: 'DELETE',
  });
}

// Also export as upsertProvider alias for backward-compat with SettingsScreen
export async function upsertProvider(payload: { provider: string; mode: string; apiKey?: string; modelName?: string }) {
  if (payload.apiKey) {
    return saveApiKey({
      provider: payload.provider,
      mode: payload.mode,
      apiKey: payload.apiKey,
      modelName: payload.modelName,
    });
  }
  // No key to save — just resolve with no-op
  return null;
}

export async function deleteProvider(id: string) {
  return deleteProviderKey(id);
}
