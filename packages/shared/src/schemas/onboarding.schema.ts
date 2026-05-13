import { z } from 'zod';

export const CliProviderSchema = z.enum(['claude', 'codex', 'gemini']);
export const ApiProviderSchema = z.enum(['claude', 'codex', 'gemini', 'ollama', 'openrouter']);
export const ProviderModeSchema = z.enum(['cli', 'api_key']);

export const OnboardingProfileRequestSchema = z
  .object({
    name: z.string().trim().min(1),
    email: z.string().trim().email().nullable().optional(),
  })
  .strict();

export const OnboardingGoalRequestSchema = z
  .object({
    goal: z.string().trim().min(1),
    resumeDocumentId: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

export const OnboardingProviderRequestSchema = z
  .object({
    provider: ApiProviderSchema,
    mode: ProviderModeSchema,
    apiKey: z.string().trim().min(1).optional(),
    makeDefault: z.boolean().default(true),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.mode === 'cli' && !CliProviderSchema.safeParse(value.provider).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cli mode supports only: claude, codex, gemini',
        path: ['provider'],
      });
    }

    if (value.mode === 'api_key' && (!value.apiKey || value.apiKey.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'apiKey is required for api_key mode',
        path: ['apiKey'],
      });
    }
  });

export const OnboardingProviderTestRequestSchema = z
  .object({
    provider: ApiProviderSchema,
    mode: ProviderModeSchema,
    apiKey: z.string().trim().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.mode === 'cli' && !CliProviderSchema.safeParse(value.provider).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cli mode supports only: claude, codex, gemini',
        path: ['provider'],
      });
    }

    if (value.mode === 'api_key' && (!value.apiKey || value.apiKey.trim().length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'apiKey is required for api_key mode',
        path: ['apiKey'],
      });
    }
  });

export const OnboardingCompleteRequestSchema = z
  .object({
    allowSkip: z.boolean().optional(),
  })
  .strict();

export const LocalUserProfileUpdateRequestSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().nullable().optional(),
    goal: z.string().trim().min(1).nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'at least one user field is required',
  });

export type OnboardingProfileRequest = z.infer<typeof OnboardingProfileRequestSchema>;
export type OnboardingGoalRequest = z.infer<typeof OnboardingGoalRequestSchema>;
export type OnboardingProviderRequest = z.infer<typeof OnboardingProviderRequestSchema>;
export type OnboardingProviderTestRequest = z.infer<typeof OnboardingProviderTestRequestSchema>;
export type OnboardingCompleteRequest = z.infer<typeof OnboardingCompleteRequestSchema>;
export type LocalUserProfileUpdateRequest = z.infer<typeof LocalUserProfileUpdateRequestSchema>;

