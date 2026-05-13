import type { RequestHandler } from 'express';
import { OnboardingQuery } from '@iprep/db';
import { LocalUserProfileUpdateRequestSchema } from '@iprep/shared';
import { ApiError, ApiResponse, StatusCodes, asyncHandler } from '../utils/index.js';

type ValidationIssue = {
  message: string;
  path?: PropertyKey[];
  code?: string;
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

export const getLocalUserProfile: RequestHandler = asyncHandler(async (_req, res) => {
  const profile = await OnboardingQuery.getLocalUserProfile();
  if (!profile) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'failed to fetch local user profile');
  }

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          goal: profile.goal,
          resumeDocumentId: profile.resumeDocumentId,
          onboardingStep: profile.onboardingStep.toLowerCase(),
          isOnboardingComplete: profile.isOnboardingComplete,
        },
      },
      'User profile fetched successfully',
    ),
  );
});

export const updateLocalUserProfile: RequestHandler = asyncHandler(async (req, res) => {
  const result = LocalUserProfileUpdateRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const profile = await OnboardingQuery.updateLocalUserProfile(result.data);
  if (!profile) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'failed to update local user profile');
  }

  res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      {
        user: {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          goal: profile.goal,
          resumeDocumentId: profile.resumeDocumentId,
          onboardingStep: profile.onboardingStep.toLowerCase(),
          isOnboardingComplete: profile.isOnboardingComplete,
        },
      },
      'User profile updated successfully',
    ),
  );
});

