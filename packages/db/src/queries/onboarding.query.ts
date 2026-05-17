import { prisma } from '../prisma.js';
import type { AIProvider, OnboardingStep, ProviderMode } from '../generated/prisma/enums.js';

const LOCAL_USER_ID = 'local_user';

export interface SaveProfileInput {
  name: string;
  email?: string | null;
}

export interface SaveGoalInput {
  goal: string;
  goalTypes?: string[] | null;
  resumeDocumentId?: string | null;
}

export interface UpsertProviderCredentialInput {
  provider: AIProvider;
  mode: ProviderMode;
  modelName?: string | null;
  hasApiKey: boolean;
  isWorking: boolean;
  lastTestPassed: boolean;
  lastTestMessage?: string | null;
  makeDefault?: boolean;
  apiKeyHash?: string | null;
  apiKeyCiphertext?: string | null;
  apiKeyIv?: string | null;
  apiKeyAuthTag?: string | null;
}

function stepForGoal(goal?: string | null): OnboardingStep {
  return goal && goal.trim().length > 0 ? 'PROVIDER' : 'GOAL';
}

function asPreferenceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function ensureLocalUser() {
  return prisma.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: {
      id: LOCAL_USER_ID,
      name: 'iPrep User',
      onboardingStep: 'PROFILE',
      isOnboardingComplete: false,
    },
  });
}

async function ensureUserOnboarding(userId: string) {
  return prisma.userOnboarding.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      currentStep: 'PROFILE',
      profileCompleted: false,
      goalCompleted: false,
      providerCompleted: false,
      isComplete: false,
    },
  });
}

export const OnboardingQuery = {
  async getLocalUserProfile() {
    const user = await ensureLocalUser();

    return prisma.user.findUnique({
      where: { id: user.id },
      include: {
        onboarding: true,
      },
    });
  },

  async getOnboardingState() {
    const user = await ensureLocalUser();
    await ensureUserOnboarding(user.id);

    return prisma.user.findUnique({
      where: { id: user.id },
      include: {
        onboarding: true,
        providers: {
          orderBy: [{ isSelected: 'desc' }, { updatedAt: 'desc' }],
        },
      },
    });
  },

  async saveProfile(input: SaveProfileInput) {
    const user = await ensureLocalUser();

    await ensureUserOnboarding(user.id);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          name: input.name,
          email: input.email ?? null,
          onboardingStep: 'GOAL',
          isOnboardingComplete: false,
        },
      }),
      prisma.userOnboarding.update({
        where: { userId: user.id },
        data: {
          profileCompleted: true,
          currentStep: 'GOAL',
          isComplete: false,
        },
      }),
    ]);

    return this.getOnboardingState();
  },

  async saveGoal(input: SaveGoalInput) {
    const user = await ensureLocalUser();
    await ensureUserOnboarding(user.id);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          goal: input.goal,
          goalTypes: input.goalTypes ?? undefined,
          resumeDocumentId: input.resumeDocumentId ?? null,
          onboardingStep: 'PROVIDER',
          isOnboardingComplete: false,
        },
      }),
      prisma.userOnboarding.update({
        where: { userId: user.id },
        data: {
          goalCompleted: true,
          currentStep: 'PROVIDER',
          isComplete: false,
        },
      }),
    ]);

    return this.getOnboardingState();
  },

  async upsertProviderCredential(input: UpsertProviderCredentialInput) {
    const user = await ensureLocalUser();
    await ensureUserOnboarding(user.id);

    await prisma.$transaction(async (tx) => {
      if (input.makeDefault) {
        await tx.providerCredential.updateMany({
          where: { userId: user.id },
          data: { isSelected: false },
        });
      }

      await tx.providerCredential.upsert({
        where: {
          userId_provider_mode: {
            userId: user.id,
            provider: input.provider,
            mode: input.mode,
          },
        },
        update: {
          modelName: input.modelName ?? null,
          hasApiKey: input.hasApiKey,
          apiKeyHash: input.apiKeyHash ?? null,
          apiKeyCiphertext: input.apiKeyCiphertext ?? null,
          apiKeyIv: input.apiKeyIv ?? null,
          apiKeyAuthTag: input.apiKeyAuthTag ?? null,
          isSelected: input.makeDefault ?? false,
          isWorking: input.isWorking,
          lastTestPassed: input.lastTestPassed,
          lastTestMessage: input.lastTestMessage ?? null,
          lastTestedAt: new Date(),
        },
        create: {
          userId: user.id,
          provider: input.provider,
          mode: input.mode,
          modelName: input.modelName ?? null,
          hasApiKey: input.hasApiKey,
          apiKeyHash: input.apiKeyHash ?? null,
          apiKeyCiphertext: input.apiKeyCiphertext ?? null,
          apiKeyIv: input.apiKeyIv ?? null,
          apiKeyAuthTag: input.apiKeyAuthTag ?? null,
          isSelected: input.makeDefault ?? false,
          isWorking: input.isWorking,
          lastTestPassed: input.lastTestPassed,
          lastTestMessage: input.lastTestMessage ?? null,
          lastTestedAt: new Date(),
        },
      });
    });

    const workingSelectedCount = await prisma.providerCredential.count({
      where: {
        userId: user.id,
        isSelected: true,
        isWorking: true,
      },
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          onboardingStep: workingSelectedCount > 0 ? 'COMPLETE' : 'PROVIDER',
          isOnboardingComplete: false,
          preferences:
            input.makeDefault && input.isWorking
              ? {
                  ...asPreferenceRecord(user.preferences),
                  aiMode: input.mode,
                  aiProvider: input.provider,
                  aiModel: input.modelName ?? '',
                }
              : undefined,
        },
      }),
      prisma.userOnboarding.update({
        where: { userId: user.id },
        data: {
          providerCompleted: workingSelectedCount > 0,
          currentStep: workingSelectedCount > 0 ? 'COMPLETE' : 'PROVIDER',
          isComplete: false,
        },
      }),
    ]);

    return this.getOnboardingState();
  },

  async completeOnboarding() {
    const user = await ensureLocalUser();
    await ensureUserOnboarding(user.id);

    const [profile, providers] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id } }),
      prisma.providerCredential.count({
        where: {
          userId: user.id,
          isSelected: true,
          isWorking: true,
        },
      }),
    ]);

    if (!profile) return null;

    const hasProfile = profile.name.trim().length > 0;
    const hasGoal = profile.goal !== null && profile.goal.trim().length > 0;
    const hasProvider = providers > 0;

    if (!hasProfile || !hasGoal || !hasProvider) {
      await prisma.userOnboarding.update({
        where: { userId: user.id },
        data: {
          profileCompleted: hasProfile,
          goalCompleted: hasGoal,
          providerCompleted: hasProvider,
          currentStep: hasProfile ? (hasGoal ? 'PROVIDER' : 'GOAL') : 'PROFILE',
          isComplete: false,
          lastSkippedAt: new Date(),
        },
      });

      return {
        completed: false,
        hasProfile,
        hasGoal,
        hasProvider,
      };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          onboardingStep: 'COMPLETE',
          isOnboardingComplete: true,
        },
      }),
      prisma.userOnboarding.update({
        where: { userId: user.id },
        data: {
          profileCompleted: true,
          goalCompleted: true,
          providerCompleted: true,
          currentStep: 'COMPLETE',
          isComplete: true,
          completedAt: new Date(),
        },
      }),
    ]);

    return {
      completed: true,
      hasProfile: true,
      hasGoal: true,
      hasProvider: true,
    };
  },

  async updateLocalUserProfile(input: Partial<SaveProfileInput> & { goal?: string | null }) {
    const user = await ensureLocalUser();

    const updateData: {
      name?: string;
      email?: string | null;
      goal?: string | null;
      onboardingStep?: OnboardingStep;
      isOnboardingComplete?: boolean;
    } = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.goal !== undefined) {
      updateData.goal = input.goal;
      updateData.onboardingStep = stepForGoal(input.goal);
      updateData.isOnboardingComplete = false;
    }

    if (Object.keys(updateData).length === 0) {
      return this.getLocalUserProfile();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return this.getLocalUserProfile();
  },

  async getDecryptionPayload(provider: AIProvider, mode: ProviderMode) {
    const user = await ensureLocalUser();
    return prisma.providerCredential.findUnique({
      where: {
        userId_provider_mode: {
          userId: user.id,
          provider,
          mode,
        },
      },
      select: {
        provider: true,
        mode: true,
        apiKeyCiphertext: true,
        apiKeyIv: true,
        apiKeyAuthTag: true,
        hasApiKey: true,
      },
    });
  },
};

export default OnboardingQuery;
