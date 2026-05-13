import { z } from 'zod';

const UserEmailSchema = z.string().trim().email().nullable().optional();
const UserPhoneSchema = z.number().int().nullable().optional();
const UserIdSchema = z.string().trim().min(1, 'user id is required');

export const CreateUserRequestSchema = z.object({
  id: UserIdSchema.optional(),
  name: z.string().trim().min(1),
  email: UserEmailSchema,
  phone: UserPhoneSchema,
}).strict();

export const UpdateUserRequestSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: UserEmailSchema,
    phone: UserPhoneSchema,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one user field is required',
  });

export const UserIdParamSchema = z
  .object({
    id: UserIdSchema,
  })
  .strict();

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UserIdParams = z.infer<typeof UserIdParamSchema>;
