import { useMemo, useState } from 'react'
import {
  Bot,
  CheckCircle2,
  FileUp,
  KeyRound,
  Loader2,
  Terminal,
  UserRound,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PROVIDER_OPTIONS, getProviderOption } from '@/lib/provider-models'
import { cn } from '@/lib/utils'

import {
  completeOnboarding,
  saveGoal,
  saveProfile,
  saveProvider,
  testProvider,
  uploadResume,
} from './api'
import type {
  GoalFormState,
  GoalType,
  OnboardingStep,
  ProfileFormState,
  ProviderFormState,
} from './types'

const goalOptions: Array<{
  value: GoalType
  label: string
  description: string
}> = [
  {
    value: 'INTERVIEW_PRACTICE',
    label: 'Interview practice',
    description:
      'Practice HR, behavioral, technical, DSA, system design, or role-specific interviews.',
  },
  {
    value: 'COMMUNICATION_IMPROVEMENT',
    label: 'Communication improvement',
    description:
      'Improve client communication, English clarity, vocabulary, confidence, and pacing.',
  },
]

type OnboardingScreenProps = {
  initialStep: OnboardingStep
  onComplete: () => void
}

export function OnboardingScreen({
  initialStep,
  onComplete,
}: OnboardingScreenProps) {
  const [step, setStep] = useState<OnboardingStep>(
    initialStep === 'complete' ? 'profile' : initialStep,
  )
  const [profile, setProfile] = useState<ProfileFormState>({
    name: '',
    email: '',
  })
  const [goal, setGoal] = useState<GoalFormState>({
    goalTypes: ['INTERVIEW_PRACTICE'],
    description: '',
    resumeFile: null,
  })
  const defaultProvider = getProviderOption('claude') ?? PROVIDER_OPTIONS[0]
  const [provider, setProvider] = useState<ProviderFormState>({
    provider: defaultProvider.key,
    mode: defaultProvider.defaultMode,
    modelName: defaultProvider.defaultModelId,
    apiKey: '',
    testStatus: 'idle',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeStepIndex = stepOrder.indexOf(step)

  async function handleProfileContinue() {
    if (!profile.name.trim()) {
      setError('Name is required.')
      return
    }

    if (profile.email && !profile.email.includes('@')) {
      setError('Enter a valid email or leave it empty.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await saveProfile({
        name: profile.name.trim(),
        email: profile.email.trim() || undefined,
      })
      setStep('goal')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleGoalContinue() {
    if (goal.goalTypes.length === 0) {
      setError('Select at least one goal.')
      return
    }

    if (!goal.description.trim()) {
      setError('Add a short goal description.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      let resumeDocumentId = goal.resumeDocumentId

      if (goal.resumeFile) {
        resumeDocumentId = await uploadResume(goal.resumeFile)
        setGoal((current) => ({ ...current, resumeDocumentId }))
      }

      await saveGoal({
        goalTypes: goal.goalTypes,
        goal: goal.description.trim(),
        resumeDocumentId,
      })
      setStep('provider')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  async function handleProviderTest() {
    if (provider.mode === 'API_KEY' && !provider.apiKey.trim()) {
      setError('API key is required for API key mode.')
      return
    }

    setError(null)
    setProvider((current) => ({
      ...current,
      testStatus: 'testing',
      testMessage: undefined,
    }))

    try {
      const result = await testProvider({
        provider: provider.provider,
        mode: provider.mode,
        modelName: provider.modelName,
        apiKey:
          provider.mode === 'API_KEY' ? provider.apiKey.trim() : undefined,
      })

      setProvider((current) => ({
        ...current,
        testStatus: result.passed ? 'passed' : 'failed',
        testMessage: result.message,
      }))
    } catch (err) {
      setProvider((current) => ({
        ...current,
        testStatus: 'failed',
        testMessage: getErrorMessage(err),
      }))
    }
  }

  async function handleFinish() {
    if (provider.testStatus !== 'passed') {
      setError('Test connection before finishing setup.')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await saveProvider({
        provider: provider.provider,
        mode: provider.mode,
        modelName: provider.modelName,
        apiKey:
          provider.mode === 'API_KEY' ? provider.apiKey.trim() : undefined,
        makeDefault: true,
      })
      await completeOnboarding()
      onComplete()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="onboarding-shell">
      <div className="onboarding-brand">
        <div className="brand-mark">i</div>
        <div>
          <div className="brand-name">iPrep</div>
          <div className="brand-tag">First setup</div>
        </div>
      </div>

      <Card className="onboarding-card">
        <CardHeader>
          <Badge variant="muted">Step {activeStepIndex + 1} of 3</Badge>
          <CardTitle className="onboarding-title">Set up your local coach</CardTitle>
          <CardDescription>
            This setup is saved through your local iPrep server and stored in
            your local database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper activeStep={step} />
          {error ? <div className="form-error">{error}</div> : null}

          {step === 'profile' ? (
            <ProfileStep
              profile={profile}
              isSaving={isSaving}
              onChange={setProfile}
              onContinue={handleProfileContinue}
            />
          ) : null}

          {step === 'goal' ? (
            <GoalStep
              goal={goal}
              isSaving={isSaving}
              onBack={() => setStep('profile')}
              onChange={setGoal}
              onContinue={handleGoalContinue}
            />
          ) : null}

          {step === 'provider' ? (
            <ProviderStep
              provider={provider}
              isSaving={isSaving}
              onBack={() => setStep('goal')}
              onChange={setProvider}
              onFinish={handleFinish}
              onTest={handleProviderTest}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function Stepper({ activeStep }: { activeStep: OnboardingStep }) {
  return (
    <div className="stepper">
      {stepOrder.map((stepName, index) => {
        const isActive = activeStep === stepName
        const isDone = stepOrder.indexOf(activeStep) > index

        return (
          <div
            className={cn('stepper-item', isActive && 'active', isDone && 'done')}
            key={stepName}
          >
            <span>{isDone ? <CheckCircle2 /> : index + 1}</span>
            <strong>{stepLabels[stepName]}</strong>
          </div>
        )
      })}
    </div>
  )
}

function ProfileStep({
  profile,
  isSaving,
  onChange,
  onContinue,
}: {
  profile: ProfileFormState
  isSaving: boolean
  onChange: (profile: ProfileFormState) => void
  onContinue: () => void
}) {
  return (
    <div className="form-stack">
      <div className="step-heading">
        <UserRound />
        <div>
          <h2>Profile</h2>
          <p>Your name personalizes dashboards, reports, and AI responses.</p>
        </div>
      </div>

      <label className="field">
        <span>Name</span>
        <input
          value={profile.name}
          onChange={(event) =>
            onChange({ ...profile, name: event.target.value })
          }
          placeholder="Your name"
        />
      </label>

      <label className="field">
        <span>Email</span>
        <input
          value={profile.email}
          onChange={(event) =>
            onChange({ ...profile, email: event.target.value })
          }
          placeholder="Optional"
          type="email"
        />
      </label>

      <div className="form-actions">
        <Button disabled={isSaving} onClick={onContinue}>
          {isSaving ? <Loader2 className="spin" /> : null}
          Continue
        </Button>
      </div>
    </div>
  )
}

function GoalStep({
  goal,
  isSaving,
  onBack,
  onChange,
  onContinue,
}: {
  goal: GoalFormState
  isSaving: boolean
  onBack: () => void
  onChange: (goal: GoalFormState) => void
  onContinue: () => void
}) {
  function toggleGoal(goalType: GoalType) {
    const goalTypes = goal.goalTypes.includes(goalType)
      ? goal.goalTypes.filter((current) => current !== goalType)
      : [...goal.goalTypes, goalType]

    onChange({ ...goal, goalTypes })
  }

  return (
    <div className="form-stack">
      <div className="step-heading">
        <FileUp />
        <div>
          <h2>Goal and context</h2>
          <p>Choose one or both goals. Resume upload happens on Continue.</p>
        </div>
      </div>

      <div className="goal-card-grid">
        {goalOptions.map((option) => (
          <button
            className={cn(
              'choice-card',
              goal.goalTypes.includes(option.value) && 'selected',
            )}
            key={option.value}
            type="button"
            onClick={() => toggleGoal(option.value)}
          >
            <span className="choice-check">
              {goal.goalTypes.includes(option.value) ? <CheckCircle2 /> : null}
            </span>
            <strong>{option.label}</strong>
            <p>{option.description}</p>
          </button>
        ))}
      </div>

      <label className="field">
        <span>Short description</span>
        <textarea
          value={goal.description}
          onChange={(event) =>
            onChange({ ...goal, description: event.target.value })
          }
          placeholder="Example: I want to prepare for Java backend interviews and improve client-facing English communication."
          rows={5}
        />
      </label>

      <label className="field">
        <span>Resume</span>
        <input
          accept=".pdf,.docx,.md"
          onChange={(event) =>
            onChange({
              ...goal,
              resumeFile: event.target.files?.[0] ?? null,
              resumeDocumentId: undefined,
            })
          }
          type="file"
        />
      </label>

      <div className="form-actions">
        <Button disabled={isSaving} variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button disabled={isSaving} onClick={onContinue}>
          {isSaving ? <Loader2 className="spin" /> : null}
          Continue
        </Button>
      </div>
    </div>
  )
}

function ProviderStep({
  provider,
  isSaving,
  onBack,
  onChange,
  onFinish,
  onTest,
}: {
  provider: ProviderFormState
  isSaving: boolean
  onBack: () => void
  onChange: (provider: ProviderFormState) => void
  onFinish: () => void
  onTest: () => void
}) {
  const providerOption = useMemo(
    () => getProviderOption(provider.provider) ?? PROVIDER_OPTIONS[0],
    [provider.provider],
  )

  function setProviderKey(providerKey: ProviderFormState['provider']) {
    const nextProvider = getProviderOption(providerKey) ?? PROVIDER_OPTIONS[0]

    onChange({
      ...provider,
      provider: providerKey,
      mode: nextProvider.defaultMode,
      modelName: nextProvider.defaultModelId,
      apiKey: '',
      testStatus: 'idle',
      testMessage: undefined,
    })
  }

  function setMode(mode: ProviderFormState['mode']) {
    onChange({
      ...provider,
      mode,
      apiKey: mode === 'CLI' ? '' : provider.apiKey,
      testStatus: 'idle',
      testMessage: undefined,
    })
  }

  return (
    <div className="form-stack">
      <div className="step-heading">
        <Bot />
        <div>
          <h2>AI provider</h2>
          <p>Choose at least one CLI or API-key based agent and test it.</p>
        </div>
      </div>

      <div className="provider-grid">
        {PROVIDER_OPTIONS.map((option) => (
          <button
            className={cn(
              'provider-card',
              provider.provider === option.key && 'selected',
            )}
            key={option.key}
            type="button"
            onClick={() => setProviderKey(option.key)}
          >
            <strong>{option.label}</strong>
            <span>{option.supportedModes.join(' / ')}</span>
          </button>
        ))}
      </div>

      <div className="segmented-control">
        {providerOption.supportedModes.map((mode) => (
          <button
            className={cn(provider.mode === mode && 'active')}
            key={mode}
            type="button"
            onClick={() => setMode(mode)}
          >
            {mode === 'CLI' ? <Terminal /> : <KeyRound />}
            {mode === 'CLI' ? 'CLI' : 'API Key'}
          </button>
        ))}
      </div>

      <label className="field">
        <span>Model</span>
        <select
          value={provider.modelName}
          onChange={(event) =>
            onChange({
              ...provider,
              modelName: event.target.value,
              testStatus: 'idle',
              testMessage: undefined,
            })
          }
        >
          {providerOption.models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.label}
            </option>
          ))}
        </select>
      </label>

      {provider.mode === 'API_KEY' ? (
        <label className="field">
          <span>API key</span>
          <input
            value={provider.apiKey}
            onChange={(event) =>
              onChange({
                ...provider,
                apiKey: event.target.value,
                testStatus: 'idle',
                testMessage: undefined,
              })
            }
            placeholder="Paste provider API key"
            type="password"
          />
        </label>
      ) : (
        <div className="provider-note">
          CLI mode will ask the local server to run the provider test command.
          Claude CLI can complete onboarding after a successful test.
        </div>
      )}

      {provider.testMessage ? (
        <div className={cn('test-message', provider.testStatus)}>
          {provider.testMessage}
        </div>
      ) : null}

      <div className="form-actions">
        <Button disabled={isSaving} variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          disabled={provider.testStatus === 'testing'}
          variant="secondary"
          onClick={onTest}
        >
          {provider.testStatus === 'testing' ? <Loader2 className="spin" /> : null}
          Test Connection
        </Button>
        <Button
          disabled={isSaving || provider.testStatus !== 'passed'}
          onClick={onFinish}
        >
          {isSaving ? <Loader2 className="spin" /> : null}
          Finish Setup
        </Button>
      </div>
    </div>
  )
}

const stepOrder: OnboardingStep[] = ['profile', 'goal', 'provider']

const stepLabels: Record<OnboardingStep, string> = {
  profile: 'Profile',
  goal: 'Goal',
  provider: 'Provider',
  complete: 'Complete',
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.'
}
