import type { Prisma } from '../generated/prisma';
import { prisma } from '../index';

export class SettingsQuery {
  // --- Preferences ---
  static async getPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });
    return user?.preferences || {};
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
    const { provider, mode, modelName, apiKeyHash, apiKeyCiphertext, apiKeyIv, apiKeyAuthTag, hasApiKey } = data;
    
    // Check if the combination already exists
    const existing = await prisma.providerCredential.findUnique({
      where: {
        userId_provider_mode: {
          userId,
          provider,
          mode
        }
      }
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
        }
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
        }
      });
    }
  }

  static async deleteProvider(id: string, userId: string) {
    return prisma.providerCredential.deleteMany({
      where: { id, userId },
    });
  }
}
