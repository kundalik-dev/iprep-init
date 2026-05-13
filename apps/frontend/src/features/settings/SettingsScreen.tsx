import { useState } from 'react';
import { cn } from '@/lib/utils';

export function SettingsScreen({
  theme,
  setTheme,
}: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}) {
  const [activeTab, setActiveTab] = useState<'providers' | 'apikeys' | 'preferences'>('preferences');

  return (
    <div style={{ padding: 0 }}>
      <div className="page-header" style={{ padding: '28px 32px 0' }}>
        <div className="page-header-left">
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Configure providers, API keys, and preferences</div>
        </div>
      </div>
      <div className="page-body" style={{ padding: '24px 32px 40px' }}>
        <div className="settings-layout" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="settings-nav">
            <button
              className={cn('settings-nav-item', activeTab === 'providers' && 'active')}
              onClick={() => setActiveTab('providers')}
            >
              ⚡ Providers
            </button>
            <button
              className={cn('settings-nav-item', activeTab === 'apikeys' && 'active')}
              onClick={() => setActiveTab('apikeys')}
            >
              🔑 API Keys
            </button>
            <button
              className={cn('settings-nav-item', activeTab === 'preferences' && 'active')}
              onClick={() => setActiveTab('preferences')}
            >
              ⚙ Preferences
            </button>
          </div>
          <div id="settings-content">
            {activeTab === 'preferences' && <PreferencesTab theme={theme} setTheme={setTheme} />}
            {activeTab === 'providers' && <ProvidersTab />}
            {activeTab === 'apikeys' && <ApiKeysTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreferencesTab({
  theme,
  setTheme,
}: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}) {
  return (
    <>
      <div className="settings-section-title">Preferences</div>
      <div className="settings-section-sub">Customize your default interview experience.</div>
      <div className="settings-form">
        <div className="input-group">
          <div className="input-label">Default Tutor</div>
          <select className="input" id="pref-tutor">
            <option value="alex">Alex Chen</option>
            <option value="sarah">Sarah Jenkins</option>
          </select>
        </div>
        <div className="input-group">
          <div className="input-label">Default Package</div>
          <select className="input" id="pref-pkg">
            <option value="behavioral">Behavioral Interview</option>
            <option value="technical">Technical Interview</option>
          </select>
        </div>
        <div className="settings-divider"></div>
        <div className="toggle-wrap">
          <div className="toggle-info">
            <div className="toggle-title">Voice Mode</div>
            <div className="toggle-desc">Enable microphone input during sessions</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="toggle-wrap">
          <div className="toggle-info">
            <div className="toggle-title">Auto-Analyze on End</div>
            <div className="toggle-desc">Automatically generate analysis when session ends</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" defaultChecked />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="toggle-wrap">
          <div className="toggle-info">
            <div className="toggle-title">Dark Theme</div>
            <div className="toggle-desc">Toggle between dark and light interface</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="settings-divider"></div>
        <button className="btn btn-primary" style={{ width: 'fit-content' }}>
          Save Preferences
        </button>
      </div>
    </>
  );
}

function ProvidersTab() {
  return (
    <>
      <div className="settings-section-title">AI Providers</div>
      <div className="settings-section-sub">
        Configured providers for speech, analysis, and coaching.
      </div>
      <div className="provider-card">
        <div className="provider-icon">🎙</div>
        <div className="provider-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <div className="provider-name">Deepgram</div>
            <span className="status-dot connected">Connected</span>
          </div>
          <div className="provider-type">Speech-to-Text</div>
          <div className="provider-note">Primary transcription engine</div>
        </div>
      </div>
    </>
  );
}

function ApiKeysTab() {
  return (
    <>
      <div className="settings-section-title">API Keys</div>
      <div className="settings-section-sub">
        Keys are stored locally and never sent to iPrep servers. Used only for direct provider calls.
      </div>
      <div className="api-key-form">
        <div className="api-key-row">
          <div className="input-label">OpenAI</div>
          <div className="input-with-action">
            <input className="input" type="password" placeholder="Secondary fallback AI…" />
          </div>
        </div>
        <button className="btn btn-primary" style={{ width: 'fit-content' }}>
          Save Keys
        </button>
      </div>
    </>
  );
}
