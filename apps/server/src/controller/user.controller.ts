import type { RequestHandler } from 'express';
import { UserQuery } from '@iprep/db';
import type { CreateUserInput, UpdateUserInput } from '@iprep/db';
import {
  CreateUserRequestSchema,
  UpdateUserRequestSchema,
  UserIdParamSchema,
} from '@iprep/shared';
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

function parseUserId(params: unknown): string {
  const result = UserIdParamSchema.safeParse(params);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  return result.data.id;
}

export const findAllUsers: RequestHandler = asyncHandler(async (_req, res) => {
  const users = await UserQuery.findAll();

  res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, { users, total: users.length }, 'Users fetched successfully'),
  );
});

export const findUserById: RequestHandler = asyncHandler(async (req, res) => {
  const userId = parseUserId(req.params);
  const user = await UserQuery.findById(userId);

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'user not found', ['user does not exist']);
  }

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { user }, 'User fetched successfully'));
});

export const createUser: RequestHandler = asyncHandler(async (req, res) => {
  const result = CreateUserRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const { id, name, email, phone } = result.data;
  const userData: CreateUserInput = { name };

  if (id !== undefined) userData.id = id;
  if (email !== undefined) userData.email = email;
  if (phone !== undefined) userData.phone = phone;

  const user = await UserQuery.createUser(userData);

  res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(StatusCodes.CREATED, { user }, 'User created successfully'));
});

export const updateUser: RequestHandler = asyncHandler(async (req, res) => {
  const userId = parseUserId(req.params);
  const result = UpdateUserRequestSchema.safeParse(req.body);
  if (!result.success) {
    throw buildValidationError(result.error.issues);
  }

  const { name, email, phone } = result.data;
  const userData: UpdateUserInput = {};

  if (name !== undefined) userData.name = name;
  if (email !== undefined) userData.email = email;
  if (phone !== undefined) userData.phone = phone;

  const user = await UserQuery.update(userId, userData);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { user }, 'User updated successfully'));
});

export const deleteUser: RequestHandler = asyncHandler(async (req, res) => {
  const userId = parseUserId(req.params);
  await UserQuery.delete(userId);

  res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, { id: userId }, 'User deleted successfully'));
});
