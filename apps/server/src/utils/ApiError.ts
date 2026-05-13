import type { StatusCode } from './statusCodes.js';
import StatusCodes from './statusCodes.js';

export class ApiError extends Error {
  public readonly statusCode: StatusCode;
  public readonly success = false;
  public readonly errors: string[];
  public readonly data = null;
  public readonly details?: unknown;

  constructor(
    statusCode: StatusCode = StatusCodes.INTERNAL_SERVER_ERROR,
    message = 'Something went wrong',
    errors: string[] = [],
    detailsOrStack?: unknown,
    stack?: string,
  ) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.details =
      typeof detailsOrStack === 'string' && stack === undefined ? undefined : detailsOrStack;

    const resolvedStack =
      typeof detailsOrStack === 'string' && stack === undefined ? detailsOrStack : stack;

    if (resolvedStack) {
      this.stack = resolvedStack;
    } else {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
