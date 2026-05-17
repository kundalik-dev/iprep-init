import { prisma } from '../prisma.js';

function asPreferenceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export class SettingsQuery {
  // --- Preferences ---
  static async getPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const preferences = asPreferenceRecord(user?.preferences);
    if (preferences.aiMode && preferences.aiProvider) return preferences;

    const selectedProvider = await prisma.providerCredential.findFirst({
      where: { userId, isSelected: true, isWorking: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!selectedProvider) return preferences;

    return {
      ...preferences,
      aiMode: selectedProvider.mode,
      aiProvider: selectedProvider.provider,
      aiModel: selectedProvider.modelName ?? '',
    };
  }

  static async updatePreferences(userId: string, preferences: any) {
    return prisma.user.update({
      where: { id: userId },
      data: { preferences },
      select: { preferences: true },
    });
  }

  // --- Providers ---
  static async getProviders(userId: string) {
    return prisma.providerCredential.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getProviderById(id: string, userId: string) {
    return prisma.providerCredential.findFirst({
      where: { id, userId },
    });
  }

  static async upsertProvider(userId: string, data: any) {
    const {
      provider,
      mode,
      modelName,
      apiKeyHash,
      apiKeyCiphertext,
      apiKeyIv,
      apiKeyAuthTag,
      hasApiKey,
    } = data;

    // Check if the combination already exists
    const existing = await prisma.providerCredential.findUnique({
      where: {
        userId_provider_mode: {
          userId,
          provider,
          mode,
        },
      },
    });

    if (existing) {
      return prisma.providerCredential.update({
        where: { id: existing.id },
        data: {
          modelName,
          hasApiKey,
          apiKeyHash,
          apiKeyCiphertext,
          apiKeyIv,
          apiKeyAuthTag,
          isWorking: false, // Reset test status on update
          lastTestPassed: null,
          lastTestMessage: null,
        },
      });
    } else {
      return prisma.providerCredential.create({
        data: {
          userId,
          provider,
          mode,
          modelName,
          hasApiKey,
          apiKeyHash,
          apiKeyCiphertext,
          apiKeyIv,
          apiKeyAuthTag,
        },
      });
    }
  }

  static async deleteProvider(id: string, userId: string) {
    return prisma.providerCredential.deleteMany({
      where: { id, userId },
    });
  }

  static async markProviderTestResult(
    id: string,
    userId: string,
    passed: boolean,
    message: string,
  ) {
    return prisma.providerCredential.updateMany({
      where: { id, userId },
      data: {
        isWorking: passed,
        lastTestPassed: passed,
        lastTestMessage: message,
        lastTestedAt: new Date(),
      },
    });
  }
}
