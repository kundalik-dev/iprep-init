import { useEffect, useState, type ComponentType } from 'react';
import {
  BarChart3,
  Bot,
  FolderOpen,
  History,
  Mic,
  Moon,
  Play,
  Settings,
  Sun,
} from 'lucide-react';

import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import {
  ConnectLocalScreen,
  Placeholder,
  StartupScreen,
} from '@/components/layout/SystemScreens';

import {
  checkHealth,
  getBootstrapOnboarding,
  getOnboardingProgress,
} from '@/features/onboarding/api';
import type { OnboardingProgress, ServerStatus } from '@/features/onboarding/types';
import { cn } from '@/lib/utils';

export type ViewId =
  | 'dashboard'
  | 'new-interview'
  | 'history'
  | 'chat'
  | 'files'
  | 'communication'
  | 'settings';

type NavItem = {
  id: ViewId;
  label: string;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  badge?: string;
};

const practiceNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'new-interview', label: 'New Interview', icon: Play, badge: 'Start' },
  { id: 'history', label: 'History', icon: History },
];

const toolNav: NavItem[] = [
  { id: 'chat', label: 'AI Coach', icon: Bot },
  { id: 'files', label: 'Notes & Files', icon: FolderOpen },
  { id: 'communication', label: 'Communication', icon: Mic },
];

export default function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

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

  if (serverStatus === 'checking') {
    return <StartupScreen />;
  }

  if (serverStatus === 'offline') {
    return <ConnectLocalScreen onRetry={loadStartupState} />;
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
    <div id="app">
      <aside id="sidebar">
        <div className="sb-brand">
          <div className="sb-logo">
            <span
              style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#fff',
                fontStyle: 'italic',
                lineHeight: 1,
                letterSpacing: '-1px',
              }}
            >
              i
            </span>
          </div>
          <div className="sb-brand-text">
            <span className="sb-name">iPrep</span>
            <span className="sb-tag">AI Coach</span>
          </div>
        </div>

        <nav className="sb-nav">
          <div className="sb-nav-section">
            <span className="sb-section-label">Practice</span>
            {practiceNav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn('nav-item', activeView === item.id && 'active')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView(item.id);
                  }}
                >
                  <span className="nav-icon">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </a>
              );
            })}
          </div>

          <div className="sb-nav-section" style={{ marginTop: '16px' }}>
            <span className="sb-section-label">Tools</span>
            {toolNav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={cn('nav-item', activeView === item.id && 'active')}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView(item.id);
                  }}
                >
                  <span className="nav-icon">
                    <Icon size={16} strokeWidth={2} />
                  </span>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </a>
              );
            })}
          </div>
        </nav>

        <div className="sb-footer">
          <button
            className="theme-btn"
            title="Toggle theme"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
          >
            <span id="theme-icon">
              {theme === 'dark' ? (
                <Sun size={15} strokeWidth={2} />
              ) : (
                <Moon size={15} strokeWidth={2} />
              )}
            </span>
          </button>
          <a
            href="#settings"
            className={cn('nav-item nav-settings', activeView === 'settings' && 'active')}
            style={{ flex: 1 }}
            onClick={(e) => {
              e.preventDefault();
              setActiveView('settings');
            }}
          >
            <span className="nav-icon">
              <Settings size={16} strokeWidth={2} />
            </span>
            <span className="nav-label">Settings</span>
          </a>
        </div>
      </aside>

      <main id="main">
        <div id="view-root">
          {activeView === 'dashboard' ? (
            <DashboardScreen />
          ) : activeView === 'settings' ? (
            <SettingsScreen theme={theme} setTheme={setTheme} />
          ) : (
            <Placeholder view={activeView} />
          )}
        </div>
      </main>
    </div>
  );
}
