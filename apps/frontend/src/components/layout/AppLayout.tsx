import { Moon, Settings, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { practiceNav, toolNav, type ViewId } from '@/config/navigation';
import { ChatScreen } from '@/features/chat/ChatScreen';
import { DashboardScreen } from '@/features/dashboard/DashboardScreen';
import { NotesFilesScreen } from '@/features/notes-files/NotesFilesScreen';
import { SettingsScreen } from '@/features/settings/SettingsScreen';
import { Placeholder } from '@/components/layout/SystemScreens';

interface AppLayoutProps {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export function AppLayout({ activeView, setActiveView, theme, setTheme }: AppLayoutProps) {
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
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
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
          ) : activeView === 'chat' ? (
            <ChatScreen />
          ) : activeView === 'files' ? (
            <NotesFilesScreen />
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
