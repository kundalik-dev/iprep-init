import type { ProviderKey, ProviderMode } from '@/lib/provider-models';

export type GoalType = 'INTERVIEW_PRACTICE' | 'COMMUNICATION_IMPROVEMENT';

export type OnboardingStep = 'profile' | 'goal' | 'provider' | 'complete';

export type ServerStatus = 'checking' | 'online' | 'offline';

export type TestStatus = 'idle' | 'testing' | 'passed' | 'failed';

export type ProfileFormState = {
  name: string;
  email: string;
};

export type GoalFormState = {
  goalTypes: GoalType[];
  description: string;
  resumeFile: File | null;
  resumeDocumentId?: string;
};

export type ProviderFormState = {
  provider: ProviderKey;
  mode: ProviderMode;
  modelName: string;
  apiKey: string;
  testStatus: TestStatus;
  testMessage?: string;
};

export type OnboardingProgress = {
  isComplete: boolean;
  currentStep: OnboardingStep;
  missingSteps: string[];
};
