import { useEffect, useState } from 'react';
import { Bot, Terminal, Edit2, Trash2, Plus, Sparkles, Mic, Brain, Zap, KeyRound, Settings as SettingsIcon, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPreferences, updatePreferences, getProviders, deleteProvider, type ProviderData } from './api';

const mockProviders = [
  {
    id: 'deepgram',
    name: 'Deepgram Nova 2',
    status: 'active',
    statusClass: 'status-active',
    type: 'Speech-to-Text • nova-2-general',
    desc: 'Primary STT provider. Provides low-latency streaming transcription with punctuation.',
    icon: <Mic size={20} />
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    status: 'active',
    statusClass: 'status-active',
    type: 'AI Analysis • claude-3-5-sonnet-20241022',
    desc: 'Primary analysis, coaching, and session generation engine.',
    icon: <Brain size={20} />
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    status: 'fallback',
    statusClass: 'status-fallback',
    type: 'AI Analysis • gemini-1.5-pro-002',
    desc: 'Fallback AI provider when Claude is rate-limited or unavailable.',
    icon: <Sparkles size={20} />
  },
  {
    id: 'gpt4o',
    name: 'OpenAI GPT-4o',
    status: 'configured',
    statusClass: 'status-configured',
    type: 'AI Analysis • gpt-4o-2024-11-20',
    desc: 'Secondary fallback. Higher cost per token than primary providers.',
    icon: <Bot size={20} />
  },
  {
    id: 'whisper',
    name: 'OpenAI Whisper',
    status: 'not configured',
    statusClass: 'status-disabled',
    type: 'Speech to Text • whisper-1',
    desc: 'Alternative STT. Higher accuracy on accented speech, higher latency.',
    icon: <Mic size={20} />
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    status: 'not installed',
    statusClass: 'status-disabled',
    type: 'Local AI',
    desc: 'Run models locally for offline use. No API key or internet required.',
    icon: <Terminal size={20} />,
    command: 'brew install ollama && ollama pull llama3.2'
  }
];

export function SettingsScreen({
  theme,
  setTheme,
}: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}) {
  const [activeTab, setActiveTab] = useState<'providers' | 'apikeys' | 'preferences'>('apikeys');

  return (
    <div style={{ padding: 0 }}>
      <div className="page-header" style={{ padding: '28px 32px 0' }}>
        <div className="page-header-left">
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Configure providers, API keys, and preferences</div>
        </div>
      </div>
      <div className="page-body" style={{ padding: '24px 32px 40px' }}>
        <div className="settings-layout">
          <div className="settings-nav">
            <button
              className={cn('settings-nav-item', activeTab === 'providers' && 'active')}
              onClick={() => setActiveTab('providers')}
            >
              <Zap size={16} /> Providers
            </button>
            <button
              className={cn('settings-nav-item', activeTab === 'apikeys' && 'active')}
              onClick={() => setActiveTab('apikeys')}
            >
              <KeyRound size={16} /> API Keys
            </button>
            <button
              className={cn('settings-nav-item', activeTab === 'preferences' && 'active')}
              onClick={() => setActiveTab('preferences')}
            >
              <SettingsIcon size={16} /> Preferences
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({
    defaultTutor: 'alex',
    defaultPackage: 'behavioral',
    voiceMode: true,
    autoAnalyze: true,
  });

  useEffect(() => {
    getPreferences().then((data) => {
      if (data && Object.keys(data).length > 0) {
        setPrefs(prev => ({ ...prev, ...data }));
      }
      setLoading(false);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences(prefs);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="spin" size={24} style={{ margin: '0 auto' }} /></div>;
  }

  return (
    <>
      <div className="settings-section-title">Preferences</div>
      <div className="settings-section-sub">Customize your default interview experience.</div>
      <div className="settings-form">
        <div className="input-group">
          <div className="input-label">Default Tutor</div>
          <select 
            className="input" 
            value={prefs.defaultTutor}
            onChange={e => setPrefs({...prefs, defaultTutor: e.target.value})}
          >
            <option value="alex">Alex Chen</option>
            <option value="sarah">Sarah Jenkins</option>
          </select>
        </div>
        <div className="input-group">
          <div className="input-label">Default Package</div>
          <select 
            className="input"
            value={prefs.defaultPackage}
            onChange={e => setPrefs({...prefs, defaultPackage: e.target.value})}
          >
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
            <input 
              type="checkbox" 
              checked={prefs.voiceMode}
              onChange={e => setPrefs({...prefs, voiceMode: e.target.checked})}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="toggle-wrap">
          <div className="toggle-info">
            <div className="toggle-title">Auto-Analyze on End</div>
            <div className="toggle-desc">Automatically generate analysis when session ends</div>
          </div>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={prefs.autoAnalyze}
              onChange={e => setPrefs({...prefs, autoAnalyze: e.target.checked})}
            />
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
        <button 
          className="btn btn-primary" 
          style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleSave}
          disabled={saving}
        >
          {saving && <Loader2 size={16} className="spin" />}
          Save Preferences
        </button>
      </div>
    </>
  );
}

function ProvidersTab() {
  type DisplayProvider = (typeof mockProviders)[number] & { dbId?: string };
  const [dbProviders, setDbProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = () => {
    setLoading(true);
    getProviders().then((data) => {
      setDbProviders(data || []);
      setLoading(false);
    }).catch((e) => {
      console.error(e);
      setLoading(false);
    });
  };

  useEffect(() => {
    const timer = window.setTimeout(() => fetchProviders(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDelete = async (dbId: string) => {
    if (confirm('Are you sure you want to remove this provider?')) {
      await deleteProvider(dbId);
      fetchProviders();
    }
  };

  const displayProviders: DisplayProvider[] = mockProviders.map(p => {
    const found = dbProviders.find(db => db.provider === p.id.toUpperCase());
    if (found) {
      return {
        ...p,
        status: found.isWorking ? 'active' : 'configured',
        statusClass: found.isWorking ? 'status-active' : 'status-configured',
        dbId: found.id
      };
    }
    return p;
  });

  return (
    <>
      <div className="settings-section-header">
        <div>
          <div className="settings-section-title">AI Providers</div>
          <div className="settings-section-sub">
            Configured providers for speech, analysis, and coaching. Fallback chain runs top to bottom.
          </div>
        </div>
        <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Add Provider
        </button>
      </div>
      
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="spin" size={24} style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className="settings-provider-list">
          {displayProviders.map((provider) => (
            <div key={provider.id} className="settings-provider-card">
              <div className="spc-icon">
                {provider.icon}
              </div>
              <div className="spc-content">
                <div className="spc-header">
                  <div className="spc-title-row">
                    <span className="spc-name">{provider.name}</span>
                    <span className={cn('spc-status', provider.statusClass)}>
                      <span className="spc-status-dot"></span> {provider.status}
                    </span>
                  </div>
                  <div className="spc-actions">
                    <button className="spc-action-btn" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    {provider.dbId && (
                      <button 
                        className="spc-action-btn danger" 
                        title="Delete"
                        onClick={() => handleDelete(provider.dbId!)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="spc-type">{provider.type}</div>
                <div className="spc-desc">{provider.desc}</div>
                {provider.command && (
                  <div className="spc-command-box">
                    <strong>Run:</strong> {provider.command}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ApiKeysTab() {
  const apiKeys = [
    {
      id: 'deepgram',
      label: 'Deepgram',
      placeholder: 'STT provider for live transcription...',
    },
    {
      id: 'claude',
      label: 'Anthropic / Claude',
      placeholder: 'Primary AI analysis engine...',
    },
    {
      id: 'gemini',
      label: 'Google Gemini',
      placeholder: 'Fallback AI provider...',
    },
    {
      id: 'openai',
      label: 'OpenAI',
      placeholder: 'Secondary fallback AI...',
    },
  ];

  return (
    <>
      <div className="settings-section-title">API Keys</div>
      <div className="settings-section-sub">
        Keys are stored locally and never sent to iPrep servers. Used only for direct provider calls.
      </div>
      <div className="api-key-form">
        {apiKeys.map((provider) => (
          <div className="api-key-row" key={provider.id}>
            <label className="input-label" htmlFor={`${provider.id}-api-key`}>
              {provider.label}
            </label>
            <div className="input-with-action api-key-input">
              <input
                className="input"
                id={`${provider.id}-api-key`}
                type="password"
                placeholder={provider.placeholder}
              />
              <button className="input-action-btn" type="button" aria-label={`Show ${provider.label} API key`}>
                <Eye size={15} />
              </button>
            </div>
          </div>
        ))}
        <button className="btn btn-primary" style={{ width: 'fit-content' }}>
          Save Keys
        </button>
      </div>
    </>
  );
}
