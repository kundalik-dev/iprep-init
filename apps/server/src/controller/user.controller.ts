import { Request, Response } from 'express';
import { UserQuery } from '@iprep/db';
import type { CreateUserInput, UpdateUserInput } from '@iprep/db';
import { CreateUserRequestSchema, UpdateUserRequestSchema } from '@iprep/shared';

interface UserParams {
  id: string;
}

function isPrismaErrorWithCode(err: unknown, code: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code?: unknown }).code === code
  );
}

function sendWriteError(res: Response, err: unknown): void {
  if (isPrismaErrorWithCode(err, 'P2002')) {
    res.status(409).json({ message: 'user with this email or phone already exists' });
    return;
  }

  if (isPrismaErrorWithCode(err, 'P2025')) {
    res.status(404).json({ message: 'user not found' });
    return;
  }

  const message = err instanceof Error ? err.message : 'User request failed';
  res.status(500).json({ message });
}

function sendValidationError(res: Response, error: { issues: Array<{ message: string }> }): void {
  res.status(400).json({ message: error.issues[0]?.message ?? 'invalid request body' });
}

export const findAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserQuery.findAll();

    res.status(200).json({ users });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users';
    res.status(500).json({ message });
  }
};

export const findUserById = async (req: Request<UserParams>, res: Response) => {
  try {
    const user = await UserQuery.findById(req.params.id);

    if (!user) {
      res.status(404).json({ message: 'user not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
    res.status(500).json({ message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const result = CreateUserRequestSchema.safeParse(req.body);
    if (!result.success) {
      sendValidationError(res, result.error);
      return;
    }

    const { id, name, email, phone } = result.data;
    const userData: CreateUserInput = {
      ...(id ? { id } : {}),
      name,
    };

    if (email !== undefined) userData.email = email;

    if (phone !== undefined) userData.phone = phone;

    const user = await UserQuery.createUser(userData);

    res.status(201).json({ user });
  } catch (err: unknown) {
    sendWriteError(res, err);
  }
};

export const updateUser = async (req: Request<UserParams>, res: Response) => {
  try {
    const result = UpdateUserRequestSchema.safeParse(req.body);
    if (!result.success) {
      sendValidationError(res, result.error);
      return;
    }

    const { name, email, phone } = result.data;
    const userData: UpdateUserInput = {};

    if (name !== undefined) userData.name = name;
    if (email !== undefined) userData.email = email;
    if (phone !== undefined) userData.phone = phone;

    const user = await UserQuery.update(req.params.id, userData);

    res.status(200).json({ user });
  } catch (err: unknown) {
    sendWriteError(res, err);
  }
};

export const deleteUser = async (req: Request<UserParams>, res: Response) => {
  try {
    await UserQuery.delete(req.params.id);

    res.status(204).send();
  } catch (err: unknown) {
    sendWriteError(res, err);
  }
};
