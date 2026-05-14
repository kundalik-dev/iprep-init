import { useEffect, useState } from 'react';
import {
  Bot, Terminal, Trash2, Sparkles, Mic, Brain,
  Zap, KeyRound, Settings as SettingsIcon, Eye, EyeOff,
  Loader2, CheckCircle2, XCircle, ShieldCheck, FlaskConical,
  Copy, CheckCheck, Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getPreferences,
  updatePreferences,
  getProviders,
  saveApiKey,
  deleteProviderKey,
  testProviderKey,
  getCliStatus,
  type ProviderData,
  type CliEntry,
} from './api';

// ── Static provider catalog (UI display layer only) ───────────────────────────
const PROVIDER_CATALOG = [
  { 
    key: 'OTHER',
    name: 'Deepgram',
    label: 'Deepgram',
    type: 'Speech-to-Text',
    placeholder: 'dg_••••••••••••••••••••••••••••••••',
    desc: 'Primary STT provider. Low-latency streaming transcription with punctuation.',
    icon: <Mic size={20} />,
    noKey: false,
  },
  {
    key: 'CLAUDE',
    name: 'Anthropic Claude',
    label: 'Anthropic / Claude',
    type: 'AI Analysis',
    placeholder: 'sk-ant-••••••••••••••••••••••••••••••',
    desc: 'Primary analysis, coaching, and session generation engine.',
    icon: <Brain size={20} />,
    noKey: false,
  },
  {
    key: 'GEMINI',
    name: 'Google Gemini',
    label: 'Google Gemini',
    type: 'AI Analysis',
    placeholder: 'AIza••••••••••••••••••••••••••••••••',
    desc: 'Fallback AI provider when Claude is rate-limited or unavailable.',
    icon: <Sparkles size={20} />,
    noKey: false,
  },
  {
    key: 'CODEX',
    name: 'OpenAI GPT',
    label: 'OpenAI',
    type: 'AI Analysis',
    placeholder: 'sk-••••••••••••••••••••••••••••••••••',
    desc: 'Secondary fallback. Compatible with GPT-4o and GPT-4 Turbo.',
    icon: <Bot size={20} />,
    noKey: false,
  },
  {
    key: 'OLLAMA',
    name: 'Ollama (Local)',
    label: 'Ollama',
    type: 'Local AI (no key needed)',
    placeholder: 'No API key required',
    desc: 'Run models locally for offline use. No API key or internet required.',
    icon: <Terminal size={20} />,
    noKey: true,
  },
] as const;

const PLACEHOLDER_MASK = '••••••••••••••••';

// ── Root ──────────────────────────────────────────────────────────────────────
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

// ── Preferences Tab ───────────────────────────────────────────────────────────
function PreferencesTab({
  theme,
  setTheme,
}: {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [prefs, setPrefs] = useState({
    defaultTutor: 'alex',
    defaultPackage: 'behavioral',
    voiceMode: true,
    autoAnalyze: true,
  });

  useEffect(() => {
    getPreferences()
      .then((data) => {
        if (data && Object.keys(data).length > 0) setPrefs(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await updatePreferences(prefs);
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="settings-section-title">Preferences</div>
      <div className="settings-section-sub">Customize your default interview experience.</div>
      <div className="settings-form">
        <div className="input-group">
          <div className="input-label">Default Tutor</div>
          <select className="input" value={prefs.defaultTutor} onChange={e => setPrefs({ ...prefs, defaultTutor: e.target.value })}>
            <option value="alex">Alex Chen</option>
            <option value="sarah">Sarah Jenkins</option>
          </select>
        </div>
        <div className="input-group">
          <div className="input-label">Default Package</div>
          <select className="input" value={prefs.defaultPackage} onChange={e => setPrefs({ ...prefs, defaultPackage: e.target.value })}>
            <option value="behavioral">Behavioral Interview</option>
            <option value="technical">Technical Interview</option>
          </select>
        </div>
        <div className="settings-divider" />
        <Toggle
          label="Voice Mode"
          desc="Enable microphone input during sessions"
          checked={prefs.voiceMode}
          onChange={v => setPrefs({ ...prefs, voiceMode: v })}
        />
        <Toggle
          label="Auto-Analyze on End"
          desc="Automatically generate analysis when session ends"
          checked={prefs.autoAnalyze}
          onChange={v => setPrefs({ ...prefs, autoAnalyze: v })}
        />
        <Toggle
          label="Dark Theme"
          desc="Toggle between dark and light interface"
          checked={theme === 'dark'}
          onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        />
        <div className="settings-divider" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="btn btn-primary"
            style={{ width: 'fit-content', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Loader2 size={15} className="spin" /> : null}
            Save Preferences
          </button>
          {saveStatus === 'saved' && (
            <span style={{ color: 'var(--success, #4ade80)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <CheckCircle2 size={15} /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span style={{ color: 'var(--danger, #f87171)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
              <XCircle size={15} /> Save failed
            </span>
          )}
        </div>
      </div>
    </>
  );
}

// ── Providers Tab ─────────────────────────────────────────────────────────────
type TestState = { status: 'idle' | 'testing' | 'passed' | 'failed'; message?: string };

function ProvidersTab() {
  const [dbProviders, setDbProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [testState, setTestState] = useState<Record<string, TestState>>({});
  const [cliStatus, setCliStatus] = useState<CliEntry[]>([]);
  const [cliLoading, setCliLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchProviders = () => {
    setLoading(true);
    getProviders()
      .then(data => { setDbProviders(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(fetchProviders, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setCliLoading(true);
    getCliStatus()
      .then(data => { setCliStatus(data); setCliLoading(false); })
      .catch(() => setCliLoading(false));
  }, []);

  const handleDelete = async (credentialId: string) => {
    if (!confirm('Remove this provider key?')) return;
    setDeletingId(credentialId);
    try {
      await deleteProviderKey(credentialId);
      fetchProviders();
    } catch {
      alert('Failed to delete provider key.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTest = async (credentialId: string) => {
    setTestState(s => ({ ...s, [credentialId]: { status: 'testing' } }));
    try {
      const result = await testProviderKey(credentialId);
      setTestState(s => ({
        ...s,
        [credentialId]: { status: result.passed ? 'passed' : 'failed', message: result.message },
      }));
      // Refresh so isWorking badge updates
      fetchProviders();
    } catch (err: any) {
      setTestState(s => ({ ...s, [credentialId]: { status: 'failed', message: err?.message ?? 'Unknown error' } }));
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Merge DB state into catalog
  const displayProviders = PROVIDER_CATALOG.map(p => {
    const db = dbProviders.find(d => d.provider === p.key);
    const status = db?.hasApiKey
      ? db.isWorking ? 'active' : 'configured'
      : 'not configured';
    const statusClass = status === 'active' ? 'status-active' : status === 'configured' ? 'status-configured' : 'status-disabled';
    return { ...p, status, statusClass, dbEntry: db ?? null };
  });

  const isWin = navigator.userAgent.includes('Windows');

  return (
    <>
      <div className="settings-section-header">
        <div>
          <div className="settings-section-title">AI Providers</div>
          <div className="settings-section-sub">
            Configured providers. Go to <strong>API Keys</strong> tab to add or update a key.
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : (
        <div className="settings-provider-list">
          {displayProviders.map((provider) => {
            const test = provider.dbEntry ? (testState[provider.dbEntry.id] ?? { status: 'idle' }) : null;
            return (
              <div key={provider.key} className="settings-provider-card">
                <div className="spc-icon">{provider.icon}</div>
                <div className="spc-content">
                  <div className="spc-header">
                    <div className="spc-title-row">
                      <span className="spc-name">{provider.name}</span>
                      <span className={cn('spc-status', provider.statusClass)}>
                        <span className="spc-status-dot" /> {provider.status}
                      </span>
                    </div>
                    <div className="spc-actions">
                      {/* Test button – only if key is stored */}
                      {provider.dbEntry?.hasApiKey && (
                        <button
                          className={cn(
                            'spc-action-btn',
                            test?.status === 'passed' && 'success',
                            test?.status === 'failed' && 'danger',
                          )}
                          title="Test API key"
                          disabled={test?.status === 'testing'}
                          onClick={() => handleTest(provider.dbEntry!.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 10px' }}
                        >
                          {test?.status === 'testing' && <Loader2 size={13} className="spin" />}
                          {test?.status === 'passed' && <CheckCircle2 size={13} />}
                          {test?.status === 'failed' && <XCircle size={13} />}
                          {(!test || test.status === 'idle') && <FlaskConical size={13} />}
                          {test?.status === 'testing' ? 'Testing…' : 'Test'}
                        </button>
                      )}
                      {/* Delete */}
                      {provider.dbEntry && (
                        <button
                          className="spc-action-btn danger"
                          title="Remove key"
                          disabled={deletingId === provider.dbEntry.id}
                          onClick={() => handleDelete(provider.dbEntry!.id)}
                        >
                          {deletingId === provider.dbEntry.id
                            ? <Loader2 size={14} className="spin" />
                            : <Trash2 size={14} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="spc-type">{provider.type}</div>
                  <div className="spc-desc">{provider.desc}</div>

                  {/* Test result */}
                  {test && test.status !== 'idle' && test.message && (
                    <div style={{
                      marginTop: '8px', fontSize: '12px',
                      color: test.status === 'passed' ? 'var(--success, #4ade80)' : test.status === 'failed' ? 'var(--danger, #f87171)' : 'var(--text-m)',
                      display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      {test.status === 'passed' && <CheckCircle2 size={12} />}
                      {test.status === 'failed' && <XCircle size={12} />}
                      {test.message}
                    </div>
                  )}

                  {/* Encryption badge */}
                  {provider.dbEntry?.hasApiKey && (
                    <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--success, #4ade80)' }}>
                      <ShieldCheck size={12} /> Key stored · AES-256-GCM encrypted
                    </div>
                  )}

                  {/* Last tested */}
                  {provider.dbEntry?.lastTestedAt && (
                    <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-m)' }}>
                      Last tested: {new Date(provider.dbEntry.lastTestedAt).toLocaleString()}
                      {provider.dbEntry.lastTestMessage && ` · ${provider.dbEntry.lastTestMessage}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLI Installation Section */}
      <div style={{ marginTop: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Monitor size={16} />
            <div className="settings-section-title" style={{ margin: 0 }}>CLI Tools</div>
          </div>
          <button
            className="btn btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-m)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer' }}
            onClick={() => {
              setCliLoading(true);
              getCliStatus()
                .then(data => { setCliStatus(data); setCliLoading(false); })
                .catch(() => setCliLoading(false));
            }}
            disabled={cliLoading}
          >
            {cliLoading ? <Loader2 size={13} className="spin" /> : <FlaskConical size={13} />}
            {cliLoading ? 'Checking…' : 'Refresh'}
          </button>
        </div>
        <div className="settings-section-sub" style={{ marginBottom: '16px' }}>
          iPrep auto-detects installed AI CLIs. Use the install commands below to add missing tools.
        </div>

        {cliLoading ? <Spinner /> : (
          <div className="settings-provider-list">
            {cliStatus.map(cli => {
              const installCmd = isWin ? cli.installWin : cli.installMac;
              const copyKey = `cli-${cli.key}`;
              return (
                <div key={cli.key} className="settings-provider-card" style={{ padding: '14px 18px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="spc-name" style={{ fontSize: '14px' }}>{cli.label}</span>
                        {cli.installed ? (
                          <span className="spc-status status-active" style={{ fontSize: '11px' }}>
                            <span className="spc-status-dot" /> Installed
                            {cli.version && <span style={{ marginLeft: '4px', opacity: 0.7 }}>({cli.version})</span>}
                          </span>
                        ) : (
                          <span className="spc-status status-disabled" style={{ fontSize: '11px' }}>
                            <span className="spc-status-dot" /> Not installed
                          </span>
                        )}
                      </div>
                    </div>
                    {installCmd && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{
                          background: 'var(--surface-3, rgba(255,255,255,0.06))',
                          border: '1px solid var(--border, rgba(255,255,255,0.1))',
                          borderRadius: '6px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          color: 'var(--text-p)',
                          flex: 1,
                          userSelect: 'all' as const,
                        }}>
                          {installCmd}
                        </code>
                        <button
                          className="spc-action-btn"
                          title="Copy install command"
                          onClick={() => handleCopy(installCmd, copyKey)}
                        >
                          {copied === copyKey ? <CheckCheck size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </>
  );
}

// ── API Keys Tab ──────────────────────────────────────────────────────────────

type KeyRowStatus = 'idle' | 'saving' | 'saved' | 'error';

function ApiKeysTab() {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [rowStatus, setRowStatus] = useState<Record<string, KeyRowStatus>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [dbIds, setDbIds] = useState<Record<string, string>>({});  // providerKey -> credential id

  const loadProviders = () => {
    setLoading(true);
    getProviders()
      .then(data => {
        const filled: Record<string, string> = {};
        const ids: Record<string, string> = {};
        data?.forEach(p => {
          if (p.hasApiKey) filled[p.provider] = PLACEHOLDER_MASK;
          ids[p.provider] = p.id;
        });
        setKeys(filled);
        setDbIds(ids);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    const timer = window.setTimeout(loadProviders, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSaveKey = async (providerKey: string) => {
    const val = keys[providerKey];
    if (!val || val === PLACEHOLDER_MASK) return;

    setRowStatus(s => ({ ...s, [providerKey]: 'saving' }));
    try {
      const result = await saveApiKey({ provider: providerKey, mode: 'API_KEY', apiKey: val });
      if (result) {
        setDbIds(ids => ({ ...ids, [providerKey]: result.id }));
        setKeys(k => ({ ...k, [providerKey]: PLACEHOLDER_MASK }));
      }
      setRowStatus(s => ({ ...s, [providerKey]: 'saved' }));
    } catch {
      setRowStatus(s => ({ ...s, [providerKey]: 'error' }));
    } finally {
      setTimeout(() => setRowStatus(s => ({ ...s, [providerKey]: 'idle' })), 3000);
    }
  };

  const handleDeleteKey = async (providerKey: string) => {
    const credId = dbIds[providerKey];
    if (!credId || !confirm('Remove this API key?')) return;
    setRowStatus(s => ({ ...s, [providerKey]: 'saving' }));
    try {
      await deleteProviderKey(credId);
      setKeys(k => { const n = { ...k }; delete n[providerKey]; return n; });
      setDbIds(ids => { const n = { ...ids }; delete n[providerKey]; return n; });
      setRowStatus(s => ({ ...s, [providerKey]: 'idle' }));
    } catch {
      setRowStatus(s => ({ ...s, [providerKey]: 'error' }));
      setTimeout(() => setRowStatus(s => ({ ...s, [providerKey]: 'idle' })), 3000);
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="settings-section-title">API Keys</div>
      <div className="settings-section-sub" style={{ marginBottom: '20px' }}>
        Keys are encrypted with AES-256-GCM and stored locally. They are never sent to iPrep servers.
      </div>

      <div className="api-key-form">
        {PROVIDER_CATALOG.filter(p => !p.noKey).map((provider) => {
          const status = rowStatus[provider.key] ?? 'idle';
          const hasStoredKey = keys[provider.key] === PLACEHOLDER_MASK;
          const isDirty = keys[provider.key] && keys[provider.key] !== PLACEHOLDER_MASK;

          return (
            <div className="api-key-row" key={provider.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="input-label" style={{ margin: 0 }} htmlFor={`${provider.key}-api-key`}>
                  {provider.label}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {hasStoredKey && !isDirty && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success, #4ade80)' }}>
                      <ShieldCheck size={12} /> Stored
                    </span>
                  )}
                  {status === 'saved' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--success, #4ade80)' }}>
                      <CheckCircle2 size={12} /> Saved
                    </span>
                  )}
                  {status === 'error' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--danger, #f87171)' }}>
                      <XCircle size={12} /> Error
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="input-with-action api-key-input" style={{ flex: 1 }}>
                  <input
                    className="input"
                    id={`${provider.key}-api-key`}
                    type={showKeys[provider.key] ? 'text' : 'password'}
                    placeholder={provider.placeholder}
                    value={keys[provider.key] || ''}
                    onChange={e => setKeys({ ...keys, [provider.key]: e.target.value })}
                    disabled={status === 'saving'}
                  />
                  <button
                    className="input-action-btn"
                    type="button"
                    aria-label={`Toggle ${provider.label} key visibility`}
                    onClick={() => setShowKeys({ ...showKeys, [provider.key]: !showKeys[provider.key] })}
                  >
                    {showKeys[provider.key]
                      ? <EyeOff size={15} />
                      : <Eye size={15} style={{ opacity: 0.6 }} />}
                  </button>
                </div>

                <button
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handleSaveKey(provider.key)}
                  disabled={!isDirty || status === 'saving'}
                >
                  {status === 'saving' ? <Loader2 size={13} className="spin" /> : null}
                  Save
                </button>

                {hasStoredKey && (
                  <button
                    className="btn btn-sm"
                    style={{ flexShrink: 0, color: 'var(--danger, #f87171)', border: '1px solid var(--danger, #f87171)', background: 'transparent' }}
                    onClick={() => handleDeleteKey(provider.key)}
                    title="Remove key"
                    disabled={status === 'saving'}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Shared Components ─────────────────────────────────────────────────────────
function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="toggle-wrap">
      <div className="toggle-info">
        <div className="toggle-title">{label}</div>
        <div className="toggle-desc">{desc}</div>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="toggle-slider" />
      </label>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <Loader2 className="spin" size={24} style={{ margin: '0 auto' }} />
    </div>
  );
}
