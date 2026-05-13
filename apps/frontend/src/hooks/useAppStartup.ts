import { useEffect, useState } from 'react';
import {
  checkHealth,
  getBootstrapOnboarding,
  getOnboardingProgress,
} from '@/features/onboarding/api';
import type { OnboardingProgress, ServerStatus } from '@/features/onboarding/types';

export function useAppStartup() {
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);

  useEffect(() => {
    void loadStartupState();
  }, []);

  async function loadStartupState() {
    setServerStatus('checking');
    try {
      await checkHealth();
      setServerStatus('online');
      try {
        setOnboardingProgress(await getBootstrapOnboarding());
      } catch {
        setOnboardingProgress(await getOnboardingProgress());
      }
    } catch {
      setServerStatus('offline');
    }
  }

  return {
    serverStatus,
    onboardingProgress,
    setOnboardingProgress,
    retry: loadStartupState,
  };
}
