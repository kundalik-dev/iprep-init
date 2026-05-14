import { apiRequest } from '@/lib/http';

export type ProviderData = {
  id: string;
  provider: string;
  mode: string;
  modelName?: string;
  hasApiKey: boolean;
  isWorking: boolean;
  createdAt: string;
};

export type PreferencesData = Record<string, unknown>;

export type UpsertProviderPayload = {
  provider: string;
  mode: string;
  modelName?: string;
  apiKey?: string;
};

export async function getPreferences() {
  return apiRequest<PreferencesData>('/settings/preferences');
}

export async function updatePreferences(preferences: PreferencesData) {
  return apiRequest<PreferencesData>('/settings/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
}

export async function getProviders() {
  return apiRequest<ProviderData[]>('/settings/providers');
}

export async function upsertProvider(providerData: UpsertProviderPayload) {
  return apiRequest<ProviderData>('/settings/providers', {
    method: 'POST',
    body: JSON.stringify(providerData),
  });
}

export async function deleteProvider(id: string) {
  await apiRequest(`/settings/providers/${id}`, {
    method: 'DELETE',
  });
}
