import type { RequestHandler } from 'express';
import { DocumentQuery, OnboardingQuery, checkDbHealth } from '@iprep/db';
import { IprepPaths } from '@iprep/shared';
import { env } from '../config/env.js';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';

function deriveMissingSteps(state: Awaited<ReturnType<typeof OnboardingQuery.getOnboardingState>>) {
  const steps: string[] = [];
  const onboarding = state?.onboarding;

  if (!onboarding?.profileCompleted) steps.push('profile');
  if (!onboarding?.goalCompleted) steps.push('goal');
  if (!onboarding?.providerCompleted) steps.push('provider');

  return steps;
}

function mapProviders(state: Awaited<ReturnType<typeof OnboardingQuery.getOnboardingState>>) {
  return (
    state?.providers.map((provider) => ({
      key: provider.provider.toLowerCase(),
      name: provider.provider.toLowerCase(),
      mode: provider.mode === 'API_KEY' ? 'api_key' : 'cli',
      status: provider.isWorking
        ? 'configured'
        : provider.lastTestPassed === false
          ? 'failed'
          : 'pending',
      hasKey: provider.hasApiKey,
      isDefault: provider.isSelected,
      isWorking: provider.isWorking,
      lastTestPassed: provider.lastTestPassed,
      lastTestedAt: provider.lastTestedAt,
    })) ?? []
  );
}

export const getBootstrap: RequestHandler = asyncHandler(async (_req, res) => {
  const [state, documents] = await Promise.all([
    OnboardingQuery.getOnboardingState(),
    DocumentQuery.listDocuments(),
  ]);

  if (!state) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'failed to load bootstrap state');
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
        stats: {
          totalSessions: 0,
          completedSessions: 0,
          avgScore: 0,
          studyStreakDays: 0,
          totalMinutes: 0,
        },
        packages: [],
        tutors: [],
        recentInterviews: [],
        providers: mapProviders(state),
        documents,
        communication: {},
        onboarding: {
          isComplete: state.onboarding?.isComplete ?? false,
          currentStep: (state.onboarding?.currentStep ?? 'PROFILE').toLowerCase(),
          missingSteps,
        },
      },
      'Bootstrap state fetched successfully',
    ),
  );
});

export const getLocalStatus: RequestHandler = asyncHandler(async (_req, res) => {
  const [databaseReady, state] = await Promise.all([
    checkDbHealth(),
    OnboardingQuery.getOnboardingState(),
  ]);

  const providersConfigured =
    state?.providers
      .filter((provider) => provider.isWorking)
      .map((provider) => provider.provider.toLowerCase()) ?? [];

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        workspacePath: IprepPaths.root,
        databasePath: IprepPaths.dbFile,
        serverPort: env.PORT,
        databaseReady,
        configReady: true,
        providersConfigured,
        missingSetup: deriveMissingSteps(state),
      },
      'Local status fetched successfully',
    ),
  );
});
