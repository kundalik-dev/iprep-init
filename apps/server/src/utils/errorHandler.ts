import type { ErrorRequestHandler } from 'express';
import { ApiError } from './ApiError.js';
import { ApiResponse } from './ApiResponse.js';
import { StatusCodes } from './statusCodes.js';

function isPrismaErrorWithCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === code
  );
}

function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (isPrismaErrorWithCode(error, 'P2002')) {
    return new ApiError(StatusCodes.CONFLICT, 'user with this email or phone already exists', [
      'unique constraint violation',
    ]);
  }

  if (isPrismaErrorWithCode(error, 'P2025')) {
    return new ApiError(StatusCodes.NOT_FOUND, 'user not found', ['resource not found']);
  }

  const message = error instanceof Error ? error.message : 'Internal server error';
  return new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, message);
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const apiError = normalizeError(error);

  const errorData =
    apiError.errors.length > 0 || apiError.details !== undefined
      ? {
          errors: apiError.errors,
          ...(apiError.details !== undefined ? { details: apiError.details } : {}),
        }
      : null;

  res
    .status(apiError.statusCode)
    .json(new ApiResponse(apiError.statusCode, errorData, apiError.message));
};
