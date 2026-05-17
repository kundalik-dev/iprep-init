import { spawnSync } from 'node:child_process';
import type { RequestHandler } from 'express';
import { OnboardingQuery, type AIProvider, type ProviderMode } from '@iprep/db';
import {
  OnboardingCompleteRequestSchema,
  OnboardingGoalRequestSchema,
  OnboardingProfileRequestSchema,
  OnboardingProviderRequestSchema,
  OnboardingProviderTestRequestSchema,
} from '@iprep/shared';
import {
  ApiError,
  ApiResponse,
  StatusCodes,
  asyncHandler,
  encryptProviderSecret,
  hashProviderSecret,
} from '../utils/index.js';
import { testApiProviderConnection } from './provider-check.controller.js';

type ValidationIssue = {
  message: string;
  path?: PropertyKey[];
  code?: string;
};

type ProviderConnectionTestResult = {
  success: boolean;
  message: string;
};

const CLI_PROVIDER_BINARY: Record<string, string> = {
  claude: 'claude',
  codex: 'codex',
  gemini: 'gemini',
};

const PROVIDER_TO_DB: Record<string, AIProvider> = {
  claude: 'CLAUDE',
  codex: 'CODEX',
  gemini: 'GEMINI',
  ollama: 'OLLAMA',
  openrouter: 'OPENROUTER',
};

const MODE_TO_DB: Record<string, ProviderMode> = {
  cli: 'CLI',
  api_key: 'API_KEY',
};

function buildValidationError(issues: ValidationIssue[]): ApiError {
  return new ApiError(
    StatusCodes.BAD_REQUEST,
    'Validation failed',
    issues.map((issue) => issue.message),
    {
      issues: issues.map((issue) => ({
        message: issue.message,
        code: issue.code ?? 'invalid_input',
        path: issue.path?.map((segment) => String(segment)).join('.') ?? '',
      })),
    },
  );
}

function enumToClientProviderName(provider: AIProvider): string {
  return provider.toLowerCase();
}

function enumToClientProviderMode(mode: ProviderMode): string {
  return mode === 'API_KEY' ? 'api_key' : 'cli';
}

function deriveMissingSteps(state: Awaited<ReturnType<typeof OnboardingQuery.getOnboardingState>>) {
  const steps: string[] = [];
  const onboarding = state?.onboarding;

  if (!onboarding?.profileCompleted) steps.push('profile');
  if (!onboarding?.goalCompleted) steps.push('goal');
  if (!onboarding?.providerCompleted) steps.push('provider');

  return steps;
}

function testCliProvider(provider: string): ProviderConnectionTestResult {
  const binary = CLI_PROVIDER_BINARY[provider];
  if (!binary) {
    return { success: false, message: `${provider} is not supported in cli mode` };
  }

  const result = spawnSync(binary, ['--version'], {
    encoding: 'utf8',
    timeout: 4000,
    shell: process.platform === 'win32',
  });

  if (result.status === 0) {
    return { success: true, message: `${provider} cli is available` };
  }

  return {
    success: false,
    message: result.error?.message ?? result.stderr?.trim() ?? `${provider} cli is not reachable`,
  };
}

async function runProviderConnectionTest(input: {
  provider: string;
  mode: string;
  apiKey?: string;
}): Promise<ProviderConnectionTestResult> {
  if (input.mode === 'cli') {
    return testCliProvider(input.provider);
  }

  const result = await testApiProviderConnection({
    provider: input.provider,
    apiKey: input.apiKey,
  });

  return { success: result.passed, message: result.message };
}

function mapProviders(state: Awaited<ReturnType<typeof OnboardingQuery.getOnboardingState>>) {
  return (
    state?.providers.map((provider) => ({
      provider: enumToClientProviderName(provider.provider),
      mode: enumToClientProviderMode(provider.mode),
      hasKey: provider.hasApiKey,
      isDefault: provider.isSelected,
      isWorking: provider.isWorking,
      lastTestPassed: provider.lastTestPassed,
      lastTestedAt: provider.lastTestedAt,
      status: provider.isWorking
        ? 'working'
        : provider.lastTestPassed === false
          ? 'failed'
          : 'pending',
    })) ?? []
  );
}

export const getOnboarding: RequestHandler = asyncHandler(async (_req, res) => {
  const state = await OnboardingQuery.getOnboardingState();
  if (!state) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'failed to load onboarding state');
  }

  const missingSteps = deriveMissingSteps(state);

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        user: {
          id: state.id,
          name: state.name,
          email: state.email,
          goal: state.goal,
          resumeDocumentId: state.resumeDocumentId,
        },
        providers: mapProviders(state),
        onboarding: {
          isComplete: state.onboarding?.isComplete ?? false,
          currentStep: (state.onboarding?.currentStep ?? 'PROFILE').toLowerCase(),
          missingSteps,
          lastSkippedAt: state.onboarding?.lastSkippedAt ?? null,
          completedAt: state.onboarding?.completedAt ?? null,
        },
        isComplete: state.onboarding?.isComplete ?? false,
        isOnboardingComplete: state.onboarding?.isComplete ?? false,
        currentStep: (state.onboarding?.currentStep ?? 'PROFILE').toLowerCase(),
        onboardingStep: (state.onboarding?.currentStep ?? 'PROFILE').toLowerCase(),
        missingSteps,
      },
      'Onboarding state fetched successfully',
    ),
  );
});

export const saveOnboardingProfile: RequestHandler = asyncHandler(async (req, res) => {
  const result = OnboardingProfileRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const state = await OnboardingQuery.saveProfile(result.data);
  if (!state) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'failed to save profile');
  }

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        id: state.id,
        name: state.name,
        email: state.email,
        onboardingStep: 'goal',
      },
      'Onboarding profile saved successfully',
    ),
  );
});

export const saveOnboardingGoal: RequestHandler = asyncHandler(async (req, res) => {
  const result = OnboardingGoalRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const state = await OnboardingQuery.saveGoal(result.data);
  if (!state) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'failed to save goal');
  }

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        goal: state.goal,
        resumeDocumentId: state.resumeDocumentId,
        onboardingStep: 'provider',
      },
      'Onboarding goal saved successfully',
    ),
  );
});

export const testOnboardingProviderConnection: RequestHandler = asyncHandler(async (req, res) => {
  const result = OnboardingProviderTestRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const connection = await runProviderConnectionTest(result.data);

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        provider: result.data.provider,
        mode: result.data.mode,
        ok: connection.success,
        status: connection.success ? 'passed' : 'failed',
        testPassed: connection.success,
        message: connection.message,
      },
      'Provider test completed',
    ),
  );
});

export const saveOnboardingProvider: RequestHandler = asyncHandler(async (req, res) => {
  const result = OnboardingProviderRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const connection = await runProviderConnectionTest(result.data);
  if (!connection.success) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'provider test failed', [connection.message], {
      provider: result.data.provider,
      mode: result.data.mode,
    });
  }

  const dbProvider = PROVIDER_TO_DB[result.data.provider];
  const dbMode = MODE_TO_DB[result.data.mode];

  let apiKeyHash: string | null = null;
  let apiKeyCiphertext: string | null = null;
  let apiKeyIv: string | null = null;
  let apiKeyAuthTag: string | null = null;

  if (result.data.mode === 'api_key' && result.data.apiKey) {
    apiKeyHash = await hashProviderSecret(result.data.apiKey);
    const encrypted = encryptProviderSecret(result.data.apiKey);
    apiKeyCiphertext = encrypted.ciphertext;
    apiKeyIv = encrypted.iv;
    apiKeyAuthTag = encrypted.authTag;
  }

  const state = await OnboardingQuery.upsertProviderCredential({
    provider: dbProvider,
    mode: dbMode,
    modelName: result.data.modelName,
    hasApiKey: result.data.mode === 'api_key',
    apiKeyHash,
    apiKeyCiphertext,
    apiKeyIv,
    apiKeyAuthTag,
    isWorking: connection.success,
    lastTestPassed: connection.success,
    lastTestMessage: connection.message,
    makeDefault: result.data.makeDefault,
  });

  const savedProvider = state?.providers.find(
    (provider) => provider.provider === dbProvider && provider.mode === dbMode,
  );

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        provider: result.data.provider,
        mode: result.data.mode,
        hasKey: savedProvider?.hasApiKey ?? result.data.mode === 'api_key',
        status: connection.success ? 'configured' : 'failed',
        isDefault: savedProvider?.isSelected ?? !!result.data.makeDefault,
        isWorking: savedProvider?.isWorking ?? connection.success,
      },
      'Onboarding provider saved successfully',
    ),
  );
});

export const completeOnboarding: RequestHandler = asyncHandler(async (req, res) => {
  const result = OnboardingCompleteRequestSchema.safeParse(req.body ?? {});
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const completion = await OnboardingQuery.completeOnboarding();
  if (!completion) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'failed to complete onboarding');
  }

  if (!completion.completed) {
    const missingSteps = [
      !completion.hasProfile ? 'profile' : null,
      !completion.hasGoal ? 'goal' : null,
      !completion.hasProvider ? 'provider' : null,
    ].filter((step): step is string => step !== null);

    if (!result.data.allowSkip) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'onboarding cannot be completed yet',
        ['complete required steps or set allowSkip=true'],
        { missingSteps },
      );
    }

    res.status(StatusCodes.OK).json(
      new ApiResponse(
        StatusCodes.OK,
        {
          isComplete: false,
          missingSteps,
        },
        'Onboarding progress saved, user can continue later',
      ),
    );
    return;
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { isComplete: true }, 'Onboarding completed'));
});
