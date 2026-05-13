import { LOCAL_SERVER_PORT } from '@/lib/api';

export function StartupScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-s)' }}>Connecting to iPrep</p>
    </div>
  );
}

export function ConnectLocalScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="center-screen">
      <div className="card connect-card">
        <div style={{ marginBottom: '16px' }}>
          <span className="badge badge-warning" style={{ marginBottom: '8px' }}>
            Local server offline
          </span>
          <div className="page-title">Connect the hosted UI to your local iPrep server</div>
          <div className="page-subtitle">
            Start the local server on port {LOCAL_SERVER_PORT}, then retry.
          </div>
        </div>
        <div className="connect-actions">
          <code>iprep start</code>
          <button className="btn btn-primary" onClick={onRetry}>
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}

export function Placeholder({ view }: { view: string }) {
  const labels: Record<string, string> = {
    dashboard: 'Dashboard',
    'new-interview': 'New Interview',
    history: 'History',
    chat: 'AI Coach',
    files: 'Notes & Files',
    communication: 'Communication',
    settings: 'Settings',
  };

  return (
    <div style={{ padding: '32px' }}>
      <div className="card" style={{ maxWidth: '600px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
          {labels[view] || view}
        </div>
        <p style={{ color: 'var(--text-s)', marginBottom: '16px' }}>
          This view is under construction.
        </p>
        <button className="btn btn-secondary">Connect API View</button>
      </div>
    </div>
  );
}
