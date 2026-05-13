import { useEffect, useState } from 'react';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { ConnectLocalScreen, StartupScreen } from '@/components/layout/SystemScreens';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAppStartup } from '@/hooks/useAppStartup';
import type { ViewId } from '@/config/navigation';

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const { serverStatus, onboardingProgress, setOnboardingProgress, retry } = useAppStartup();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (serverStatus === 'checking') {
    return <StartupScreen />;
  }

  if (serverStatus === 'offline') {
    return <ConnectLocalScreen onRetry={retry} />;
  }

  if (!onboardingProgress) {
    return <StartupScreen />;
  }

  if (!onboardingProgress.isComplete) {
    return (
      <OnboardingScreen
        initialStep={onboardingProgress.currentStep}
        onComplete={() =>
          setOnboardingProgress({
            isComplete: true,
            currentStep: 'complete',
            missingSteps: [],
          })
        }
      />
    );
  }

  return (
    <AppLayout
      activeView={activeView}
      setActiveView={setActiveView}
      theme={theme}
      setTheme={setTheme}
    />
  );
}
