import { OnboardingQuery, type AIProvider, type ProviderMode } from '@iprep/db';
import { decryptProviderSecret } from './providerSecrets.js';

export async function getDecryptedProviderApiKey(
  provider: AIProvider,
  mode: ProviderMode,
): Promise<string | null> {
  const payload = await OnboardingQuery.getDecryptionPayload(provider, mode);
  if (!payload || !payload.hasApiKey) {
    return null;
  }

  if (!payload.apiKeyCiphertext || !payload.apiKeyIv || !payload.apiKeyAuthTag) {
    return null;
  }

  return decryptProviderSecret({
    ciphertext: payload.apiKeyCiphertext,
    iv: payload.apiKeyIv,
    authTag: payload.apiKeyAuthTag,
  });
}

