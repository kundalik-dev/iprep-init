import { apiRequest } from '@/lib/http'
import type { ProviderKey, ProviderMode } from '@/lib/provider-models'

import type { GoalType, OnboardingProgress } from './types'

type BootstrapResponse = {
  onboarding?: {
    isComplete?: boolean
    missingSteps?: string[]
    currentStep?: string
  }
}

type OnboardingResponse = {
  isOnboardingComplete?: boolean
  isComplete?: boolean
  onboardingStep?: string
  currentStep?: string
  missingSteps?: string[]
}

type ProviderTestResponse = {
  status?: string
  ok?: boolean
  message?: string
}

type UploadDocumentResponse = {
  id: string
}

export async function checkHealth() {
  await apiRequest('/health')
}

export async function getBootstrapOnboarding(): Promise<OnboardingProgress> {
  const data = await apiRequest<BootstrapResponse>('/bootstrap')
  const onboarding = data.onboarding

  return normalizeProgress({
    isComplete: onboarding?.isComplete,
    currentStep: onboarding?.currentStep,
    missingSteps: onboarding?.missingSteps,
  })
}

export async function getOnboardingProgress(): Promise<OnboardingProgress> {
  const data = await apiRequest<OnboardingResponse>('/onboarding')

  return normalizeProgress({
    isComplete: data.isOnboardingComplete ?? data.isComplete,
    currentStep: data.onboardingStep ?? data.currentStep,
    missingSteps: data.missingSteps,
  })
}

export async function saveProfile(payload: {
  name: string
  email?: string
}) {
  await apiRequest('/onboarding/profile', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function uploadResume(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('convertToMarkdown', 'true')
  formData.append('tags', 'resume,onboarding')

  const data = await apiRequest<UploadDocumentResponse>('/documents/upload', {
    method: 'POST',
    body: formData,
  })

  return data.id
}

export async function saveGoal(payload: {
  goalTypes: GoalType[]
  goal: string
  resumeDocumentId?: string
}) {
  await apiRequest('/onboarding/goal', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function testProvider(payload: {
  provider: ProviderKey
  mode: ProviderMode
  modelName: string
  apiKey?: string
}): Promise<{ passed: boolean; message: string }> {
  const data = await apiRequest<ProviderTestResponse>(
    '/onboarding/provider/test',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )

  const passed = data.ok ?? ['passed', 'ok'].includes(data.status ?? '')

  return {
    passed,
    message: data.message ?? (passed ? 'Connection test passed.' : 'Connection test failed.'),
  }
}

export async function saveProvider(payload: {
  provider: ProviderKey
  mode: ProviderMode
  modelName: string
  apiKey?: string
  makeDefault: boolean
}) {
  await apiRequest('/onboarding/provider', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function completeOnboarding() {
  await apiRequest('/onboarding/complete', {
    method: 'POST',
  })
}

function normalizeProgress({
  isComplete,
  currentStep,
  missingSteps,
}: {
  isComplete?: boolean
  currentStep?: string
  missingSteps?: string[]
}): OnboardingProgress {
  return {
    isComplete: Boolean(isComplete),
    currentStep: normalizeStep(currentStep),
    missingSteps: missingSteps ?? [],
  }
}

function normalizeStep(step?: string): OnboardingProgress['currentStep'] {
  const normalized = step?.toLowerCase()

  if (
    normalized === 'profile' ||
    normalized === 'goal' ||
    normalized === 'provider' ||
    normalized === 'complete'
  ) {
    return normalized
  }

  return 'profile'
}
