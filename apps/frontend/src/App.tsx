import { useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  History,
  Mic,
  Moon,
  Play,
  Settings,
  Sparkles,
  Target,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import {
  checkHealth,
  getBootstrapOnboarding,
  getOnboardingProgress,
} from '@/features/onboarding/api';
import type { OnboardingProgress, ServerStatus } from '@/features/onboarding/types';
import { API_BASE_URL, LOCAL_SERVER_PORT } from '@/lib/api';
import { cn } from '@/lib/utils';

type ViewId =
  | 'dashboard'
  | 'new-interview'
  | 'history'
  | 'coach'
  | 'files'
  | 'communication'
  | 'settings';

type NavItem = {
  id: ViewId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

const practiceNav: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'new-interview', label: 'New Interview', icon: Play, badge: 'Start' },
  { id: 'history', label: 'History', icon: History },
];

const toolNav: NavItem[] = [
  { id: 'coach', label: 'AI Coach', icon: Bot },
  { id: 'files', label: 'Notes & Files', icon: FolderOpen },
  { id: 'communication', label: 'Communication', icon: Mic },
];

const stats = [
  { label: 'Sessions', value: '8', meta: '4 this week' },
  { label: 'Average score', value: '79', meta: '+6 from last week' },
  { label: 'Study streak', value: '7d', meta: 'Daily practice' },
  { label: 'Minutes', value: '312', meta: 'Total practice' },
];

const setupActions = [
  'Confirm interview goal',
  'Upload resume context',
  'Add Deepgram key for voice mode',
];

const interviewTemplates = [
  {
    title: 'Behavioral Interview',
    detail: 'STAR method, leadership, conflict, ownership',
    meta: '25 min',
    level: 'Medium',
  },
  {
    title: 'Technical Interview',
    detail: 'Backend design, debugging, tradeoff questions',
    meta: '30 min',
    level: 'Hard',
  },
  {
    title: 'Communication Drill',
    detail: 'Filler words, clarity, pacing, concise answers',
    meta: '15 min',
    level: 'Easy',
  },
];

function App() {
  const [activeView, setActiveView] = useState<ViewId>('dashboard');
  const [serverStatus, setServerStatus] = useState<ServerStatus>('checking');
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);

  const activeTitle = useMemo(() => {
    return [...practiceNav, ...toolNav, { id: 'settings', label: 'Settings' }].find(
      (item) => item.id === activeView,
    )?.label;
  }, [activeView]);

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
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">i</div>
          <div>
            <div className="brand-name">iPrep</div>
            <div className="brand-tag">AI Coach</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary">
          <NavSection
            label="Practice"
            items={practiceNav}
            activeView={activeView}
            onSelect={setActiveView}
          />
          <NavSection
            label="Tools"
            items={toolNav}
            activeView={activeView}
            onSelect={setActiveView}
          />
        </nav>

        <div className="sidebar-footer">
          <Button variant="secondary" size="icon" aria-label="Theme">
            <Moon />
          </Button>
          <button
            className={cn('nav-item flex-1', activeView === 'settings' && 'active')}
            type="button"
            onClick={() => setActiveView('settings')}
          >
            <Settings className="nav-icon" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <main className="main-panel">
        <header className="page-header">
          <div>
            <h1>{activeTitle}</h1>
            <p>Local API: {API_BASE_URL}</p>
          </div>
          <div className="header-actions">
            <Badge variant="success">Port {LOCAL_SERVER_PORT}</Badge>
            <Button>
              <Play />
              Start Interview
            </Button>
          </div>
        </header>

        <section className="page-body">
          {activeView === 'dashboard' ? <Dashboard /> : <Placeholder view={activeView} />}
        </section>
      </main>
    </div>
  );
}

function StartupScreen() {
  return (
    <div className="center-screen">
      <div className="brand-mark">i</div>
      <h1>Connecting to iPrep</h1>
      <p>Checking the local server and onboarding status.</p>
    </div>
  );
}

function ConnectLocalScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="center-screen">
      <Card className="connect-card">
        <CardHeader>
          <Badge variant="warning">Local server offline</Badge>
          <CardTitle>Connect the hosted UI to your local iPrep server</CardTitle>
          <CardDescription>
            Start the local server on port {LOCAL_SERVER_PORT}, then retry.
          </CardDescription>
        </CardHeader>
        <CardContent className="connect-actions">
          <code>iprep start</code>
          <Button onClick={onRetry}>Retry Connection</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NavSection({
  label,
  items,
  activeView,
  onSelect,
}: {
  label: string;
  items: NavItem[];
  activeView: ViewId;
  onSelect: (view: ViewId) => void;
}) {
  return (
    <div className="nav-section">
      <span className="nav-section-label">{label}</span>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <button
            className={cn('nav-item', activeView === item.id && 'active')}
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
          >
            <Icon className="nav-icon" />
            <span>{item.label}</span>
            {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function Dashboard() {
  return (
    <div className="dashboard-grid">
      <section className="dashboard-hero">
        <div>
          <Badge>
            <Sparkles />
            Ready for first run
          </Badge>
          <h2>Practice interviews, review transcripts, and improve with local AI context.</h2>
          <p>
            The frontend is shaped around the `/api/v1` local server contract and the Claude HTML
            prototype visual system.
          </p>
        </div>
        <div className="hero-actions">
          <Button>
            <Play />
            New Interview
          </Button>
          <Button variant="secondary">
            <FileText />
            Add Notes
          </Button>
        </div>
      </section>

      <div className="stats-grid">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="stat-value">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="stat-meta">{stat.meta}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>Setup Actions</CardTitle>
          <CardDescription>First-run tasks from onboarding docs</CardDescription>
        </CardHeader>
        <CardContent className="setup-list">
          {setupActions.map((action) => (
            <div className="setup-row" key={action}>
              <CheckCircle2 />
              <span>{action}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="panel-card">
        <CardHeader>
          <CardTitle>Interview Templates</CardTitle>
          <CardDescription>Initial ready-made flow</CardDescription>
        </CardHeader>
        <CardContent className="template-list">
          {interviewTemplates.map((template) => (
            <div className="template-row" key={template.title}>
              <div>
                <strong>{template.title}</strong>
                <p>{template.detail}</p>
              </div>
              <div className="template-meta">
                <Badge variant="muted">
                  <Clock3 />
                  {template.meta}
                </Badge>
                <Badge variant="warning">
                  <Target />
                  {template.level}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Placeholder({ view }: { view: ViewId }) {
  const labels: Record<ViewId, string> = {
    dashboard: 'Dashboard',
    'new-interview': 'New Interview',
    history: 'History',
    coach: 'AI Coach',
    files: 'Notes & Files',
    communication: 'Communication',
    settings: 'Settings',
  };

  return (
    <Card className="placeholder-card">
      <CardHeader>
        <CardTitle>{labels[view]}</CardTitle>
        <CardDescription>Boilerplate route shell</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="secondary">Connect API View</Button>
      </CardContent>
    </Card>
  );
}

export default App;
