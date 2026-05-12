import { z } from 'zod';

const UserEmailSchema = z.string().trim().email().nullable().optional();
const UserPhoneSchema = z.number().int().nullable().optional();

export const CreateUserRequestSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  email: UserEmailSchema,
  phone: UserPhoneSchema,
});

export const UpdateUserRequestSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: UserEmailSchema,
    phone: UserPhoneSchema,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one user field is required',
  });

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
