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

export async function getPreferences() {
  const response = await apiRequest<{ data: any }>('/settings/preferences');
  return response.data || {};
}

export async function updatePreferences(preferences: any) {
  const response = await apiRequest<{ data: any }>('/settings/preferences', {
    method: 'PUT',
    body: JSON.stringify(preferences),
  });
  return response.data;
}

export async function getProviders() {
  const response = await apiRequest<{ data: ProviderData[] }>('/settings/providers');
  return response.data || [];
}

export async function upsertProvider(providerData: any) {
  const response = await apiRequest<{ data: ProviderData }>('/settings/providers', {
    method: 'POST',
    body: JSON.stringify(providerData),
  });
  return response.data;
}

export async function deleteProvider(id: string) {
  await apiRequest(`/settings/providers/${id}`, {
    method: 'DELETE',
  });
}
